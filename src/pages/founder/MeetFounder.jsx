import React, { useEffect } from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";
import founderDefaultImg from "../../assets/founder.jpg";

export default function MeetFounder() {
  const { config } = useSiteConfig();
  const companyName = config.companyName || "Bengal Tiles";
  const founderName = config.founderName || "SK Abdul Ohid";
  const imglink = "https://firebasestorage.googleapis.com/v0/b/bengal-tiles---website.firebasestorage.app/o/company%2Fbengal_tiles_owner_1.jpeg?alt=media&token=e9760f80-9e5c-4462-8d95-78181928e15d";
  const founderPhoto = config.founderPhoto || imglink || founderDefaultImg;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const beliefs = [
    {
      title: "Quality First",
      desc: "We believe quality should never be compromised.",
    },
    {
      title: "Customer Trust",
      desc: "Every customer interaction is an opportunity to build a lasting relationship.",
    },
    {
      title: "Continuous Improvement",
      desc: "We constantly learn, improve, and adapt to serve our customers better.",
    },
    {
      title: "Integrity",
      desc: "We believe in honest communication and transparent business practices.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-base py-5 sm:py-10 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-2">

        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-12 border-b border-border-base">
          <img
            src={founderPhoto}
            alt={founderName}
            className="w-48 h-48 md:w-60 md:h-60 rounded-2xl object-cover shadow-xs border border-border-base shrink-0"
          />

          <div className="space-y-3 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
              Meet Our Founder
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-base">
              {founderName}
            </h1>

            <p className="text-sm font-semibold text-primary">
              Founder & {companyName}
            </p>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-normal pt-1">
              Building with a simple belief: great businesses are built around people, trust, and meaningful solutions.
            </p>
          </div>
        </div>

        {/* About the Founder */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-base">
            About the Founder
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            {founderName} is the founder of {companyName}, with a passion for building products and experiences that make everyday life simpler and better. With a focus on quality, innovation, and customer satisfaction, he started {companyName} with the vision of creating a brand people can trust.
          </p>
        </section>

        {/* The Story Behind */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-base">
            The Story Behind {companyName}
          </h2>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Every business starts with an idea.
          </p>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            {companyName} began with a simple goal — to provide customers with quality products, transparent service, and a better overall experience. What started as a small vision has grown through continuous learning, customer feedback, and a commitment to doing things better.
          </p>

          <p className="text-sm sm:text-base text-text-base font-semibold leading-relaxed">
            Today, the focus remains the same:{" "}
            <span className="text-primary font-bold">
              quality products, honest service, and long-term relationships.
            </span>
          </p>
        </section>

        {/* Our Vision */}
        <section className="p-6 sm:p-8 rounded-2xl bg-bg-surface border border-border-base space-y-2">
          <h2 className="text-lg font-bold tracking-tight text-text-base">
            Our Vision
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            To build a trusted and customer-focused brand that delivers quality, value, and a seamless experience at every step.
          </p>
        </section>

        {/* What We Believe In */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-base">
            What We Believe In
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {beliefs.map((belief, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-bg-surface border border-border-base space-y-1.5"
              >
                <h3 className="text-sm sm:text-base font-bold text-text-base">
                  {belief.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {belief.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* A Note From Our Founder */}
        <section className="p-6 sm:p-10 rounded-2xl bg-bg-surface border-l-4 border-primary border-t border-r border-b border-border-base space-y-5">
          <h2 className="text-lg font-bold tracking-tight text-text-base">
            A Note From Our Founder
          </h2>

          <blockquote className="text-sm sm:text-base italic text-text-base leading-relaxed">
            “Our goal has never been just to build a business. It is to build something people can trust. Every product, every interaction, and every decision is guided by our commitment to quality and customer satisfaction.”
          </blockquote>

          <div className="pt-2">
            <p className="text-sm font-bold text-text-base">— {founderName}</p>
            <p className="text-xs text-text-muted mt-0.5">
              Founder, {companyName}
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
