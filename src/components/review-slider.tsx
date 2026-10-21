import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star, ArrowUpRight } from "lucide-react";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { googleReviewsUrl } from "@/data/reviews";

type Review = { id: number; reviewerName: string; rating: number; text: string; source: string; reviewUrl?: string | null; isExcerpt?: boolean; isTranslated?: boolean };

export function ReviewSlider() {
  const mapsUrl = googleReviewsUrl;
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const { data: reviews = [], isPending } = useQuery({
    queryKey: ["public-reviews"],
    staleTime: 30_000,
    queryFn: async ({ signal }): Promise<Review[]> => {
      const response = await fetch(`${ADMIN_API_BASE}/api/reviews`, { signal });
      if (!response.ok) throw new Error("Unable to load reviews");
      const payload = await response.json();
      if (!Array.isArray(payload.data)) throw new Error("Invalid reviews response");
      return payload.data;
    },
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) setAuto(false);
  }, []);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 20;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    const target = direction > 0 && element.scrollLeft >= max - 4 ? 0 : direction < 0 && element.scrollLeft <= 4 ? max : element.scrollLeft + direction * step;
    element.scrollTo({ left: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  useEffect(() => {
    if (!auto || reviews.length <= 1) return;
    const timer = window.setInterval(() => { if (!document.hidden) move(1); }, 3000);
    return () => window.clearInterval(timer);
  }, [auto, reviews.length]);

  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "";
  return <section className="bg-secondary py-14 sm:py-20" aria-labelledby="customer-review-heading" aria-roledescription="carousel">
    <div className="container-lv">
      <div className="text-center"><h2 id="customer-review-heading" className="text-3xl text-wine sm:text-4xl">Loved by Our Customers</h2>
        {reviews.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm"><b className="text-xl text-wine">{average}/5</b><span className="text-muted-foreground">Based on {reviews.length} customer reviews</span></div>}
      </div>
      {isPending ? <p role="status" className="py-10 text-center text-sm text-muted-foreground">Loading customer reviews…</p> : reviews.length === 0 ? <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-wine/10 bg-white p-8 text-center"><p className="text-sm leading-7 text-muted-foreground">Discover what our customers have to say about their experience.</p><a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-wine">Read reviews on Google <ArrowUpRight size={16} /></a></div> : <>
        <div ref={track} tabIndex={0} aria-label="Customer reviews. Swipe or use the arrow buttons to browse." className="mt-9 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onScroll={() => { const element = track.current; const card = element?.firstElementChild as HTMLElement | null; if (element && card) setCurrent(Math.round(element.scrollLeft / (card.offsetWidth + 20))); }}>
          {reviews.map((review, index) => <article key={review.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${reviews.length}`} className="flex w-full shrink-0 snap-start flex-col rounded-2xl border border-wine/10 bg-white p-6 shadow-sm md:w-[calc((100%_-_20px)/2)] lg:w-[calc((100%_-_40px)/3)]">
            <div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-wine/10 text-lg font-semibold text-wine" aria-hidden="true">{review.reviewerName.trim().charAt(0).toUpperCase()}</span><div><h3 className="font-sans text-sm font-semibold text-foreground">{review.reviewerName}</h3><span className="text-xs text-muted-foreground">{review.source === "Google" ? "Google review" : "Customer review"}</span></div></div>
            <div className="my-5 flex gap-1 text-gold" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} aria-hidden="true" className={star <= review.rating ? "fill-current" : "text-stone-200"} />)}</div>
            <p className="max-h-56 flex-1 overflow-y-auto whitespace-pre-line text-sm leading-7 text-muted-foreground">{review.text || "This customer left a star rating."}</p>
            {(review.isExcerpt || review.isTranslated) && <p className="mt-3 text-[11px] text-muted-foreground">{[review.isExcerpt ? "Review excerpt" : "", review.isTranslated ? "Translated by Google" : ""].filter(Boolean).join(" · ")}</p>}
            {review.reviewUrl && <a href={review.reviewUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-fit items-center gap-1 text-xs font-semibold text-wine">View on Google <ArrowUpRight size={13} /></a>}
          </article>)}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => move(-1)} aria-label="Previous reviews" className="grid size-11 place-items-center rounded-full border border-wine/20 bg-white text-wine hover:bg-wine/5"><ChevronLeft size={20} /></button>
          <span className="min-w-16 text-center text-xs text-muted-foreground">{Math.min(current + 1, reviews.length)} / {reviews.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next reviews" className="grid size-11 place-items-center rounded-full border border-wine/20 bg-white text-wine hover:bg-wine/5"><ChevronRight size={20} /></button>
        </div>
        <div className="mt-6 text-center"><a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-wine pb-1 text-xs font-semibold text-wine">View reviews on Google <ArrowUpRight size={14} /></a></div>
      </>}
    </div>
  </section>;
}
