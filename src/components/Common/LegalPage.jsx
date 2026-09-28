import React from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";
import LegalPdfViewer from "./LegalPdfViewer";

const DEFAULT_POLICIES = {
    termsAndConditions: `# Terms & Conditions\n\nWelcome to NeedMet. These Terms & Conditions govern your use of our website and services. By accessing or purchasing from our store, you agree to these terms.\n\n### 1. Account & Store Use\nYou must provide accurate information when creating an account or placing an order. You are responsible for maintaining the confidentiality of your account credentials.\n\n### 2. Products & Pricing\nAll product descriptions, availability, and prices listed in Indian Rupees (INR) are subject to change without prior notice. We reserve the right to modify or discontinue any product at any time.\n\n### 3. Payments & Orders\nWe accept online payments, credit/debit cards, UPI, and Cash on Delivery (where applicable). Orders are confirmed upon receipt of valid payment authorization.\n\n### 4. Intellectual Property\nAll website content, images, graphics, design, and logos are the property of NeedMet and protected under applicable copyright and intellectual property laws.`,

    privacyPolicy: `# Privacy Policy\n\nAt NeedMet, we prioritize your privacy and data security. This Privacy Policy outlines how your personal information is collected, used, and protected.\n\n### 1. Information We Collect\nWe collect personal details provided during checkout, account creation, or support inquiries, including your name, email address, phone number, and shipping address.\n\n### 2. How We Use Your Information\nYour data is used strictly to process orders, manage deliveries, send order updates, improve our services, and provide dedicated customer support.\n\n### 3. Data Protection\nWe implement industry-standard security measures and encrypted data transmission to ensure your personal details remain confidential and protected against unauthorized access.\n\n### 4. Third-Party Sharing\nWe never sell or trade your personal information. Data is shared only with trusted delivery and payment processing partners strictly necessary to fulfill your order.`,

    returnPolicy: `# Return & Refund Policy\n\nWe want you to be completely satisfied with your purchase. If you are not happy with your order, we offer a simple return and refund process.\n\n### 1. Return Window\nItems can be returned within 15 days of delivery provided they are unused, undamaged, and in their original packaging with all tags attached.\n\n### 2. Non-Returnable Items\nCustom-made, personalized products, or clearance items cannot be returned unless delivered damaged or defective.\n\n### 3. Refund Process\nOnce returned items are received and inspected, approved refunds will be credited to your original payment method within 5–7 business days.`,

    refundPolicy: `# Refund Policy\n\nOur refund policy ensures fair and prompt resolution for returned or cancelled orders.\n\n### 1. Eligibility for Refunds\nRefunds are processed for items returned within the eligible return window or orders cancelled prior to dispatch.\n\n### 2. Processing Duration\nApproved refunds are issued to the original payment method within 5 to 7 business days after inspection.`,

    shippingPolicy: `# Shipping Policy\n\nWe strive to deliver your orders safely and quickly across all supported locations.\n\n### 1. Processing Time\nStandard orders are processed within 1–2 business days. Customized or handcrafted items may require 3–5 days prior to shipment.\n\n### 2. Delivery Duration\nEstimated delivery time is 3–7 business days depending on your location. Shipping updates and tracking links will be sent via email/SMS.`,

    aboutUs: `# About NeedMet\n\nNeedMet is your ultimate destination for handcrafted artwork, custom gifts, and unique lifestyle products.\n\n### Our Mission\nTo bridge the gap between traditional craftsmanship and modern design, bringing art directly to your doorstep.\n\n### Why Choose Us?\n- Premium Quality Guarantee\n- Handcrafted with Care\n- Fast & Secure Nationwide Shipping\n- Dedicated Customer Support`
};

export function FormattedLegalContent({ content, title }) {
    const rawText = content || DEFAULT_POLICIES[title] || `# ${title}\n\nContent for ${title} will be updated soon.`;
    const blocks = rawText.split(/\n\n+/);

    return (
        <div className="space-y-6 text-text-base leading-relaxed">
            {blocks.map((block, idx) => {
                const trimmed = block.trim();
                if (trimmed.startsWith('# ')) {
                    return (
                        <h1 key={idx} className="text-xl sm:text-2xl font-bold text-text-base pb-4 border-b border-border-subtle">
                            {trimmed.replace(/^#\s+/, '')}
                        </h1>
                    );
                }
                if (trimmed.startsWith('### ')) {
                    return (
                        <h3 key={idx} className="text-base sm:text-lg font-bold text-primary pt-2">
                            {trimmed.replace(/^###\s+/, '')}
                        </h3>
                    );
                }
                if (trimmed.startsWith('## ')) {
                    return (
                        <h2 key={idx} className="text-lg sm:text-xl font-bold text-text-base pt-3 pb-1 border-b border-border-subtle/50">
                            {trimmed.replace(/^##\s+/, '')}
                        </h2>
                    );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const items = trimmed.split(/\n/).map((i) => i.replace(/^[-*]\s+/, ''));
                    return (
                        <ul key={idx} className="list-disc list-inside space-y-2 pl-2 text-sm text-text-muted">
                            {items.map((item, iIdx) => (
                                <li key={iIdx} className="leading-relaxed">{item}</li>
                            ))}
                        </ul>
                    );
                }
                return (
                    <p key={idx} className="text-sm sm:text-base text-text-muted leading-relaxed font-normal whitespace-pre-line">
                        {trimmed}
                    </p>
                );
            })}
        </div>
    );
}

/**
 * LegalPage — minimal document renderer for standard legal/policy pages.
 * Supports PDF documents via LegalPdfViewer and formatted text documents.
 */
function LegalPage({ configKey, title }) {
    const { config, loading } = useSiteConfig();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-text-muted text-sm font-medium">
                Loading policy document...
            </div>
        );
    }

    const legalData = config?.legal || {};
    const pageObj = legalData.fixedPages?.[configKey] || {};
    
    // Resolve docUrl / pdfUrl or direct string storage URL
    const docUrl = pageObj.docUrl || pageObj.pdfUrl || (typeof legalData[configKey] === "string" && legalData[configKey].startsWith("http") ? legalData[configKey] : "");

    if (pageObj.isActive === false) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-text-muted gap-2">
                <p className="text-xl font-bold text-text-base">{title}</p>
                <p className="text-sm">This policy page is currently inactive.</p>
            </div>
        );
    }

    // If Document/PDF URL is uploaded and configured in Firestore, render LegalPdfViewer
    if (docUrl) {
        return <LegalPdfViewer pdfUrl={docUrl} title={title} />;
    }

    // Otherwise render native formatted document
    const content = pageObj.content || (typeof legalData[configKey] === "string" ? legalData[configKey] : null) || DEFAULT_POLICIES[configKey];

    return (
        <div className="w-full bg-bg-base min-h-screen py-6 sm:py-8 px-4 sm:px-6 flex justify-center items-start font-sans">
            <div className="w-full max-w-[920px] bg-card border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-xs">
                <FormattedLegalContent content={content} title={title} />
            </div>
        </div>
    );
}

export default LegalPage;
