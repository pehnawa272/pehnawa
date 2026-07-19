import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import WriteReviewButton from "@/components/WriteReviewButton";

export const metadata = {
  title: "Customer Reviews | Pehnawa by Laxshmi",
  description:
    "Read honest reviews from our customers about Pehnawa's handcrafted luxury ethnic wear.",
};

export default async function ReviewsPage() {
  let reviews: any[] = [];
  let avgRating = 0;
  let totalReviews = 0;

  try {
    reviews = await prisma.review.findMany({
      where: { isApproved: true },
      include: {
        product: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    totalReviews = reviews.length;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Math.round((sum / totalReviews) * 10) / 10; // e.g. 4.3
    }
  } catch (e) {
    console.error("Failed to fetch reviews:", e);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#131313] pt-28 pb-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="font-playfair text-3xl md:text-5xl text-white font-medium">
              Customer Reviews
            </h1>
            <p className="font-montserrat text-sm text-white/50 tracking-wider max-w-xl mx-auto">
              Hear from the women who wear Pehnawa — unfiltered stories of
              craftsmanship, fit, and love at first drape.
            </p>

            {/* Average rating summary */}
            {totalReviews > 0 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <StarRating rating={Math.round(avgRating)} size={22} />
                <span className="font-montserrat text-lg text-gold font-semibold">
                  {avgRating}
                </span>
                <span className="font-montserrat text-sm text-white/40">
                  based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div className="pt-4">
              <WriteReviewButton />
            </div>
          </div>

          {/* Reviews grid */}
          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  customerName={review.customerName}
                  rating={review.rating}
                  text={review.text}
                  images={review.images || []}
                  isVerifiedPurchase={review.isVerifiedPurchase}
                  createdAt={review.createdAt.toISOString()}
                  productName={review.product?.title}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-montserrat text-white/40 text-sm">
                No reviews yet — be the first to share your Pehnawa experience.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
