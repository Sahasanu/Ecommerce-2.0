import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

const FOOT_LINKS = [
    { title: "Terms & Conditions", path: "/termsconditions" },
    { title: "Privacy Policy",     path: "/privacypolicy" },
    { title: "Return Policy",      path: "/returnpolicy" },
    { title: "About Us",           path: "/aboutus" },
];

/**
 * Footer Component
 * Renders company name, address, contacts, social links, and legal navigation.
 * All data sourced from Firestore via SiteConfigContext.
 * Falls back to placeholder text if config is empty.
 */
function Footer() {
    const { mode } = useTheme();
    const { config } = useSiteConfig();

    const { companyName, address, phones, emails, socialLinks, legal } = config;

    const activeSocials = (socialLinks || []).filter((s) => s.isActive && s.url && s.platform !== "whatsapp");

    const fullAddress = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.pincode,
    ].filter(Boolean).join(", ");

    // Build dynamic legal links — only include documents that are actually uploaded/configured & active
    const fixedMap = [
        { key: "aboutUs",           title: "About Us",           path: "/aboutus" },
        { key: "privacyPolicy",     title: "Privacy Policy",     path: "/privacypolicy" },
        { key: "termsAndConditions", title: "Terms & Conditions", path: "/termsconditions" },
        { key: "returnPolicy",       title: "Return Policy",      path: "/returnpolicy" },
        { key: "shippingPolicy",     title: "Shipping Policy",    path: "/shippingpolicy" },
        { key: "refundPolicy",       title: "Refund Policy",      path: "/refundpolicy" },
    ];

    const fixedPages = legal?.fixedPages || {};
    const activeFixedLinks = fixedMap.filter(item => {
        const page = fixedPages[item.key];
        if (!page) {
            // Check legacy string format if present
            const legacyVal = legal?.[item.key];
            return typeof legacyVal === "string" && legacyVal.trim().length > 0;
        }
        if (page.isActive === false) return false;
        const hasDocUrl = Boolean(page.docUrl || page.pdfUrl);
        const hasContent = Boolean(page.content && page.content.trim());
        return hasDocUrl || hasContent;
    });

    const customPages = Array.isArray(legal?.customPages) ? legal.customPages : [];
    const activeCustomLinks = customPages
        .filter(p => p.isActive !== false && Boolean(p.docUrl || p.pdfUrl || p.content))
        .map(p => ({ title: p.name, path: `/legal/${p.slug}` }));

    const legalLinks = [...activeFixedLinks, ...activeCustomLinks];

    return (
        <footer className="bg-bg-surface border-t border-border-base transition-colors duration-300">
            <div className="px-10 py-6">
                <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-6 text-[13px] text-text-muted">

                    {/* Brand and Address */}
                    <div className="space-y-2 text-center lg:text-left">
                        <Link to="/" className="inline-block">
                            <h2 className="text-2xl font-black tracking-tight text-primary">
                                {companyName || "Company Name"}
                            </h2>
                        </Link>
                        
                        {config.companyTagline && (
                            <div className="my-1">
                                <span className="inline-flex items-center gap-1.5   bg-primary/10   text-primary font-bold text-xs tracking-wide shadow-2xs">
                                    
                                    {config.companyTagline}
                                </span>
                            </div>
                        )}

                        <p className="font-semibold text-xs text-text-muted pt-0.5">
                            © {new Date().getFullYear()} {companyName || "Company Name"}. All rights reserved.
                        </p>

                        {(fullAddress || address?.mapUrl) && (
                            <div className="flex gap-1.5 items-center justify-center lg:justify-start pt-1">
                                <span className="material-symbols-outlined text-sm text-primary shrink-0">location_on</span>
                                {fullAddress && <span className="font-medium text-xs text-text-muted leading-relaxed">{fullAddress}</span>}
                                {address?.mapUrl && (
                                    <a
                                        href={address.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary-hover transition cursor-pointer inline-flex items-center"
                                        title="Open Location in Maps"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Social Links and Contacts */}
                    <div className="flex flex-col items-center gap-3">
                        {activeSocials.length > 0 && (
                            <div className="flex gap-3">
                                {activeSocials.map((social) => {
                                    let href = (social.url || "").trim();
                                    if (social.platform === "whatsapp") {
                                        if (!href.startsWith("http://") && !href.startsWith("https://")) {
                                            const cleanDigits = href.replace(/[^0-9]/g, "");
                                            href = cleanDigits.length >= 7 ? `https://wa.me/${cleanDigits}` : `https://${href}`;
                                        }
                                    } else if (!href.startsWith("http://") && !href.startsWith("https://")) {
                                        href = `https://${href}`;
                                    }

                                    return (
                                        <a
                                            key={social.platform}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-full border border-border-base flex items-center justify-center text-text-muted hover:text-white hover:bg-primary hover:border-primary transition-all duration-300 shadow-2xs"
                                            title={social.platform}
                                        >
                                            <i className={`fa-brands ${social.icon} text-xs`} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-text-muted">
                            {(phones || []).map((p, i) => {
                                const cleanNum = String(p.number || "").replace(/[^0-9]/g, "");
                                return p.isWhatsapp ? (
                                    <a
                                        key={i}
                                        href={`https://wa.me/${cleanNum}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex gap-1.5 items-center hover:text-emerald-600 transition cursor-pointer"
                                        title={`Chat on WhatsApp (${p.label || 'Support'})`}
                                    >
                                        <span className="material-symbols-outlined text-sm text-emerald-600">chat</span>
                                        <p className="font-medium text-xs text-text-muted hover:text-emerald-600">{p.number}</p>
                                    </a>
                                ) : (
                                    <a
                                        key={i}
                                        href={`tel:${p.number}`}
                                        className="flex gap-1.5 items-center hover:text-primary transition cursor-pointer"
                                        title={`Call ${p.label || 'Support'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm text-primary">call</span>
                                        <p className="font-medium text-xs text-text-muted hover:text-primary">{p.number}</p>
                                    </a>
                                );
                            })}
                            {(emails || []).map((e, i) => (
                                <a
                                    key={i}
                                    href={`mailto:${e.email}`}
                                    className="flex gap-1.5 items-center hover:text-primary transition cursor-pointer"
                                    title={`Email ${e.label || 'Support'}`}
                                >
                                    <span className="material-symbols-outlined text-sm text-primary">mail</span>
                                    <p className="font-medium text-xs text-text-muted hover:text-primary">{e.email}</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex flex-wrap justify-center gap-4 max-w-md">
                            {legalLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    className="underline hover:text-primary transition-colors text-xs font-bold whitespace-nowrap"
                                    to={link.path}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>
                        <p className="text-center text-sm text-text-muted">
                            Design & Develop By{" "}
                            <a href="https://needmet.in" target="_blank" rel="noopener noreferrer" className="font-bold underline text-green-600">
                                NeedMet
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </footer>
    );
}

export default Footer;