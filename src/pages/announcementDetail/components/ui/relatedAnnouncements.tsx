import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/shared/lib/services";
import { Announcement } from "@/shared/types/general";
import RenderList from "@/shared/components/utils/renderList";
import RelatedAnnouncementCard from "./relatedAnnouncementCard";
import { Link } from "react-router-dom";
import LeftArrowAltIcon from "@/shared/components/icons/leftArrowAlt";
import RightArrowAlt from "@/shared/components/icons/rightArrowAlt";
import { useMediaQuery } from "react-responsive";

const RelatedAnnouncements = (): React.JSX.Element => {
	const [searchParams] = useSearchParams();
	const announcementId = searchParams.get("announcement_id");
	const isOverMd = useMediaQuery({ query: "(min-width: 768px)" });

	const [relatedAnnouncementsData, setRelatedAnnouncementsData] = useState<Announcement[]>([]);
	const [relatedAnnouncementsError, setRelatedAnnouncementsError] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const listRef = useRef<HTMLUListElement | null>(null);

	const scroll = useCallback((direction: "left" | "right") => {
		if (listRef.current) {
			const scrollAmount = isOverMd ? 399 : 299;
			listRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	}, []);

	const fetchRelatedAnnouncements = useCallback(async () => {
		if (!announcementId) return;

		setLoading(true);
		setRelatedAnnouncementsError(null);

		const { data, error } = await supabase
			.from("announcements")
			.select("title, preview_text, created_at, user_id, announcement_id")
			.neq("announcement_id", announcementId)
			.order("created_at", { ascending: false })
			.limit(6);

		if (error) {
			console.error("Error fetching related announcements:", error);
			setRelatedAnnouncementsError(error);
			setRelatedAnnouncementsData([]);
		} else {
			setRelatedAnnouncementsData(data || []);
		}

		setLoading(false);
	}, [announcementId]);

	useEffect(() => {
		fetchRelatedAnnouncements();
	}, [fetchRelatedAnnouncements]);

	const memoizedRelatedAnnouncements = useMemo(() => relatedAnnouncementsData, [relatedAnnouncementsData]);

	return (
		<div id="related-announcements" className="flex flex-col w-full mt-32">
			<div className="md:px-16 px-4 w-full flex flex-col max-w-[1140px] mx-auto">
				<div className="flex flex-col gap-8">
					<h1 className="text-3xl font-xl">Siste kunngjøringer</h1>
					<div className="relative overflow-hidden">
						{relatedAnnouncementsError ? (
							<div></div>
						) : memoizedRelatedAnnouncements.length < 0 ? (
							<div></div>
						) : (
							<div className="flex flex-col relative overflow-hidden">
								<div className="flex gap-4">
									<div
										onClick={() => scroll("left")}
										className="p-1 rounded-full border-solid border-[1px] border-modifier-border-color transition-colors hover:bg-primary-alt duration-100 ease-in-out cursor-default"
									>
										<LeftArrowAltIcon className="fill-text-normal !w-6 !h-6" />
									</div>
									<div
										onClick={() => scroll("right")}
										className="p-1 rounded-full border-solid border-[1px] border-modifier-border-color transition-colors hover:bg-primary-alt duration-100 ease-in-out cursor-default"
									>
										<RightArrowAlt className="fill-text-normal !w-6 !h-6" />
									</div>
								</div>
								<ul
									ref={listRef}
									className="flex flex-row overflow-x-scroll w-full flex-nowrap list-none snap-x snap-mandatory proximity:snap-x-proximity !pr-[1px] whitespace-nowrap no-scrollbar"
								>
									<RenderList
										data={memoizedRelatedAnnouncements}
										render={(data: Announcement, i: number) => (
											<RelatedAnnouncementCard key={i} announcement={data} loading={loading} />
										)}
									/>
									{!loading && (
										<li className="list-none snap-start !pb-8 !pt-4 !pr-8">
											<Link to="/announcements" className="w-full h-full cursor-pointer">
												<div className="border-solid border-modifier-border-color border-[1px] hover:bg-primary-alt rounded-md relative overflow-hidden md:min-w-[400px] md:min-h-[200px] min-w-[300px] min-h-[150px] w-full h-full">
													<div className="w-full h-full p-4 flex flex-col justify-center items-center ">
														<h1 className="font-xl text-xl">Se fler kunngjøringer</h1>
													</div>
												</div>
											</Link>
										</li>
									)}
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RelatedAnnouncements;
