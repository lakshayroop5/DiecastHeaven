// Store policies, rendered by app/(public)/policies/[slug]/page.tsx.
// A block is a paragraph (string), a bullet list (string[]), or a sub-heading.
export type PolicyBlock = string | string[] | { sub: string }

export interface Policy {
  slug: string
  title: string
  description: string
  intro: PolicyBlock[]
  sections: { title: string; blocks: PolicyBlock[] }[]
  outro: PolicyBlock[]
}

const ADDRESS =
  'Diecast Heaven Udaipur\n335, Block E, Transport Nagar, Sector 14,\nUdaipur, Rajasthan – 313001, India.'

export const POLICIES: Policy[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description:
      'How Diecast Heaven Udaipur collects, uses, stores and shares your personal information.',
    intro: [
      'At Diecast Heaven Udaipur, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share your information when you visit or make a purchase through our website.',
    ],
    sections: [
      {
        title: '1. Information We Collect',
        blocks: [
          'We may collect personal information such as your name, shipping address, phone number, email address, and other details necessary to process your orders.',
          'Your personal information is handled by Diecast Heaven Udaipur. We share only the information necessary for delivery purposes, such as your name, shipping address, and phone number, with our shipping and delivery partners.',
          'Your order details, billing information, and other purchase-related records are retained by us and are not shared with unrelated third parties, except where necessary to process payments, fulfill your order, comply with legal obligations, or protect our legitimate business interests.',
        ],
      },
      {
        title: '2. How We Use Your Information',
        blocks: [
          'We use your information for the following purposes:',
          [
            'Order Fulfillment: To process, pack, ship, and deliver your purchases.',
            'Order Confirmation: To confirm your purchases and communicate important order updates.',
            'Store Improvement: To improve our website, products, services, and overall customer experience.',
            'Community Building: To keep our customers informed about relevant product launches, updates, offers, and other community activities, where applicable.',
            'Security Purposes: To help prevent fraudulent transactions, unauthorized activities, and misuse of our website.',
          ],
          'We use your information only for legitimate business purposes and take reasonable steps to protect it.',
        ],
      },
      {
        title: '3. Sharing with Third Parties',
        blocks: [
          'We may share limited information with trusted third-party service providers who help us operate our business, including delivery partners, shipping companies, and payment processors.',
          'For example, delivery partners may receive your name, address, and phone number to deliver your order, while payment processors may process the information required to complete a transaction.',
          'We aim to share only the information necessary for these services. We do not sell your personal information to third parties. Information may also be disclosed when required by applicable law or by a lawful request from the relevant authorities.',
        ],
      },
      {
        title: '4. Your Choice and Opt-Out',
        blocks: [
          'You have the choice to opt out of marketing emails at any time. If you no longer wish to receive promotional communications, you may unsubscribe using the instructions provided in the email or contact our team.',
          'Please note that opting out of marketing communications will not prevent us from sending essential messages relating to your orders, payments, deliveries, or other necessary service updates.',
        ],
      },
      {
        title: '5. Grievance Officer',
        blocks: [
          'In accordance with the Information Technology Act, 2000, and other applicable laws, if you have any concerns, questions, or complaints regarding your personal information or this Privacy Policy, please contact our team using the business address provided below.',
          'We will make reasonable efforts to review and address your concerns in accordance with applicable laws.',
        ],
      },
      {
        title: '6. Business Address',
        blocks: [ADDRESS],
      },
    ],
    outro: [],
  },
  {
    slug: 'refund',
    title: 'Return, Refund & Cancellation Policy',
    description:
      'Returns, exchanges, cancellations and refunds at Diecast Heaven Udaipur.',
    intro: [],
    sections: [
      {
        title: '1. Return Policy',
        blocks: [
          'We do not accept returns on any orders once they have been delivered, except in cases where an incorrect product has been received.',
          'If you receive a product different from the one you ordered, you must provide proper, uninterrupted video proof showing the issue. The video proof will be reviewed before a return or refund is approved.',
          'Without valid video proof, we will not be able to accept the return or process a refund.',
        ],
      },
      {
        title: '2. Exchange Policy',
        blocks: [
          'We do not offer exchanges once an order has been placed.',
          'If you have purchased a product and wish to replace it with another product, such a change will not be possible after the order has been confirmed. Please carefully review your selection before placing your order.',
        ],
      },
      {
        title: '3. Customer Support',
        blocks: [
          'Need help with your order? Contact us through WhatsApp, and our team will respond as soon as possible.',
          'Please provide your order details when contacting us so we can assist you efficiently.',
        ],
      },
      {
        title: '4. Cancellation Policy',
        blocks: [
          'All orders are final once placed and cannot be cancelled by the customer.',
          'If an order is cancelled from our side, the amount paid will not be refunded, except where a refund is required under applicable law.',
          'Please make sure you have reviewed and confirmed your order before completing your purchase. Place your order only when you are certain about your selection.',
        ],
      },
      {
        title: '5. Refund Method & Processing Time',
        blocks: [
          'If you receive an incorrect product due to an error on our part, and your claim is verified with valid video proof, we will process the eligible refund within 7 days.',
          'The refund will be transferred directly to your bank account. You may be required to provide the necessary bank details to complete the refund.',
          'Refund processing time may vary depending on your bank or payment service provider.',
        ],
      },
    ],
    outro: [
      'Important: Please carefully check your order details before placing an order. By completing your purchase, you acknowledge that you have read and understood this policy, subject to your rights under applicable law.',
    ],
  },
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    description:
      'Shipping charges, dispatch, tracking, and damage or loss in transit at Diecast Heaven Udaipur.',
    intro: [
      'At Diecast Heaven Udaipur, we take care to pack your orders securely and work with our local courier partners to ensure a smooth shipping experience. Please read our shipping policy carefully before placing an order.',
    ],
    sections: [
      {
        title: '1. Shipping Charges',
        blocks: [
          "Shipping charges will be communicated to you after your order is placed. The final shipping cost may vary depending on the product's size, weight, packaging requirements, and the total parcel weight after packing.",
          'Any applicable shipping charges will be communicated before shipment.',
        ],
      },
      {
        title: '2. Dispatch & Tracking Details',
        blocks: [
          'Tracking details will generally be shared within 24–72 hours after placing your order.',
          'We dispatch parcels through our local courier partners, with whom we have an established working relationship. Our courier partners understand the importance of handling collectible products with care.',
          'Once your parcel has been handed over to the courier company, the shipment moves through various sorting facilities, transit hubs, and delivery locations. Handling conditions at these locations may vary and are outside our direct control.',
        ],
      },
      {
        title: '3. Damage in Transit (DIT)',
        blocks: [
          'We take reasonable precautions to pack your products securely before dispatch. However, despite proper packaging, damage during transit may occasionally occur.',
          'Please understand that once a parcel leaves our premises, we cannot directly control how it is handled at different transit hubs or sorting facilities.',
          'In the event of Damage in Transit (DIT):',
          [
            'We do not provide refunds, replacements, or compensation for products damaged during transit.',
            'We are unable to guarantee the condition of the outer packaging or product after it has passed through multiple transit and handling locations.',
            'Any damage occurring during transit is beyond our direct control, and we do not assume responsibility for such incidents.',
          ],
          'Although we make every reasonable effort to minimize the risk of damage, transit damage cannot be completely ruled out.',
        ],
      },
      {
        title: '4. Lost in Transit (LIT)',
        blocks: [
          'In rare cases, a parcel may be lost during transit. If this happens, we will try to coordinate with our courier partner to obtain shipment updates and determine the status of the parcel.',
          "If the courier company approves compensation for a lost parcel, we may pass on up to 50% of the compensation amount received from the shipping company to the customer, subject to the shipment's eligibility and the courier company's applicable terms.",
          'Please note:',
          [
            'Compensation is not guaranteed.',
            "Eligibility depends on the courier company's assessment and compensation policy.",
            'The amount, if any, will depend on the compensation actually received from the courier company.',
            'If the shipment is not eligible for compensation, no such payment can be promised.',
          ],
        ],
      },
      {
        title: '5. Courier Handling & Transit Responsibility',
        blocks: [
          'We work with local courier partners who are familiar with the handling requirements of collectible products. However, after dispatch, parcels may pass through multiple third-party sorting centres, transit hubs, and delivery facilities.',
          "The handling methods and conditions at these locations may vary. Neither Diecast Heaven Udaipur nor the dispatching courier partner can directly supervise every stage of the parcel's journey.",
          'Therefore, damage caused by handling at intermediate transit facilities is outside our direct control. We do not offer refunds or compensation for such transit damage.',
          'We will, however, make reasonable efforts to assist with tracking enquiries and communication with the courier company where possible.',
        ],
      },
      {
        title: '6. Important Information Before Ordering',
        blocks: [
          'Please review your order and shipping details carefully before confirming your purchase.',
          [
            "Shipping charges may vary according to the packed parcel's final size and weight.",
            'Tracking details are generally provided within 24–72 hours after placing the order.',
            'Delivery timelines may vary depending on the courier service, destination, weather, holidays, and other transit conditions.',
            'Once dispatched, delivery handling and transit conditions are outside our direct control.',
          ],
          'By placing an order with Diecast Heaven Udaipur, you acknowledge that you have read and understood this Shipping Policy, subject to applicable consumer protection laws.',
        ],
      },
    ],
    outro: [ADDRESS],
  },
  {
    slug: 'pre-order',
    title: 'Pre-Order Policy',
    description:
      'How pre-orders, ETAs, cancellations, refunds and allocations work at Diecast Heaven Udaipur.',
    intro: [
      'At Diecast Heaven Udaipur, we offer pre-orders for selected diecast models and collectibles from various manufacturers and distributors. A pre-order allows customers to reserve an upcoming product before it is officially released or available in our inventory.',
      'Please read the following policy carefully before placing a pre-order.',
    ],
    sections: [
      {
        title: '1. What Is a Pre-Order?',
        blocks: [
          'A pre-order is an advance booking for a product that has not yet arrived in our inventory or is not currently available for immediate dispatch.',
          'By placing a pre-order, you reserve the selected product in advance, subject to availability and fulfillment by the manufacturer, supplier, or distributor.',
          [
            'Pre-ordered products are not ready-to-ship items.',
            'An advance payment or full payment may be required, depending on the product.',
            'Pre-order availability is subject to confirmation and fulfillment by our supply chain.',
            'A pre-order does not guarantee delivery on a specific date.',
            'Orders will be processed for dispatch after the product reaches us and undergoes the necessary checks.',
          ],
          'Please place a pre-order only if you understand and accept the conditions outlined in this policy.',
        ],
      },
      {
        title: '2. ETA – Estimated Time of Arrival',
        blocks: [
          'The Estimated Time of Arrival (ETA) mentioned on a product page is an approximate timeline provided for informational purposes only. It is not a guaranteed delivery or dispatch date.',
          'The actual arrival of a pre-ordered product may be earlier or later than the stated ETA.',
          'Arrival timelines depend on several factors, including:',
          [
            'Manufacturer production schedules and release dates.',
            'Licensing approvals and intellectual property permissions.',
            'Final product development and quality control.',
            'Packaging, decal, and product specification approvals.',
            'Import procedures, customs clearance, and international logistics.',
            'Distributor allocation and dispatch schedules.',
            'Shipping delays and other circumstances beyond our control.',
          ],
          'Some products may arrive before the estimated timeline, while others may be delayed by weeks or months. In certain cases, manufacturers may postpone or suspend releases without prior notice.',
          'Diecast Heaven Udaipur cannot guarantee an exact arrival date and will communicate significant updates when information becomes available to us.',
          'Please do not place a pre-order if you require delivery by a fixed date or are unwilling to accept possible delays.',
        ],
      },
      {
        title: '3. Pre-Order Cancellation Policy',
        blocks: [
          'All pre-orders are considered final once confirmed.',
          { sub: 'Customer-initiated cancellation' },
          'Once a pre-order has been placed and confirmed, the customer cannot cancel it at their own discretion.',
          "If a customer requests cancellation or the order is cancelled at the customer's request, the amount paid towards the pre-order will be treated as non-refundable, subject to applicable law.",
          'Please verify the product, variant, scale, packaging type, price, and other details before confirming your booking.',
          { sub: 'Cancellation by Diecast Heaven Udaipur, manufacturer, or distributor' },
          'If the pre-ordered product is cancelled or cannot be fulfilled by Diecast Heaven Udaipur, the manufacturer, or the distributor, the customer will receive a 100% refund of the amount paid for that pre-order.',
          [
            "The refund will be processed to the customer's bank account.",
            'The expected processing period is 7–15 working days from confirmation of the cancellation and initiation of the refund process.',
            'Any applicable bank processing time may vary.',
          ],
          'If only part of an order cannot be fulfilled, the refund will apply to the affected product or portion of the order.',
          'Nothing in this policy excludes any refund or cancellation rights that may be required under applicable law.',
        ],
      },
      {
        title: '4. Product Images, Prototypes & Final Product Variations',
        blocks: [
          'Images, renders, sample photographs, prototype images, and promotional materials displayed on our website are provided for reference and identification purposes.',
          'The final production model may differ from the images shown at the time of booking.',
          'Possible variations include:',
          [
            'Paint shade, colour tone, or finish.',
            'Decals, tampo printing, and sponsor logos.',
            'Wheels, tyres, interior, and exterior details.',
            'Minor design, styling, and manufacturing details.',
            'Packaging artwork, labels, and box design.',
            'Other changes introduced during final production.',
          ],
          'Manufacturers may revise the product after obtaining licensing approvals or completing final production checks.',
          'Such minor variations do not automatically qualify a product for cancellation, return, or refund, subject to applicable law and the actual nature of the change.',
          'If a substantial change makes the supplied product materially different from what was ordered, the matter will be reviewed in accordance with applicable consumer rights.',
        ],
      },
      {
        title: '5. Manufacturer & Licensing Changes',
        blocks: [
          'Certain diecast models feature officially licensed vehicle designs, racing liveries, sponsor logos, and other protected branding.',
          'Manufacturers may need to obtain or revise licensing permissions before production. As a result, some details, decals, liveries, colours, or design elements may be changed, simplified, or removed.',
          'These changes may occur after pre-orders have opened and may not always be reflected immediately in promotional images.',
          'Diecast Heaven Udaipur does not control manufacturer licensing decisions or production changes.',
        ],
      },
      {
        title: '6. Price & Payment Terms',
        blocks: [
          'The applicable pre-order price, advance amount, and payment conditions will be mentioned on the relevant product page or pre-order announcement.',
          'Customers must pay the specified advance or full amount to confirm their booking.',
          'An advance payment reserves the booking request but does not eliminate manufacturer or distributor fulfillment risks.',
          'Any remaining balance, if applicable, must be paid according to the payment instructions communicated by Diecast Heaven Udaipur.',
          'Customers should not assume that a booking is confirmed until confirmation has been provided.',
          'Shipping charges are additional unless the product listing explicitly states otherwise.',
          'Once a booking is confirmed, its price will be governed by the terms communicated at the time of booking, subject to any applicable legal requirements.',
        ],
      },
      {
        title: '7. Availability & Allocation',
        blocks: [
          'Pre-order quantities may depend on the allocation received from the manufacturer, importer, or distributor.',
          'Even after a booking has been accepted, the final quantity supplied to us may be reduced or cancelled by our supplier.',
          'In such cases, we will communicate the situation when reasonably possible. If we are unable to fulfill your confirmed pre-order, the refund terms in Section 3 will apply.',
          'A pre-order should not be considered a guarantee that the manufacturer will produce or allocate every announced model.',
        ],
      },
      {
        title: '8. Dispatch After Arrival',
        blocks: [
          'The ETA refers to the estimated arrival timeline of the product, not the date on which the customer will receive the parcel.',
          'After the product reaches us, additional time may be required for:',
          [
            'Inventory verification and quality checks.',
            'Sorting and matching products to confirmed pre-orders.',
            'Packing and preparing parcels for dispatch.',
            'Confirming any outstanding balance or shipping charges.',
            'Generating shipping labels and tracking information.',
          ],
          'Dispatch will take place after the necessary processing steps are completed. Delivery time will depend on the destination and courier service.',
        ],
      },
      {
        title: '9. Packaging & Product Condition',
        blocks: [
          'We make reasonable efforts to inspect and pack pre-ordered products carefully before dispatch.',
          'However, minor factory-level imperfections may occur, including small paint variations, minor printing inconsistencies, slight packaging marks, or other manufacturing tolerances.',
          'Unless the product is expressly advertised as mint-condition packaging or carries a specific condition guarantee, minor cosmetic variations in packaging should be expected with collectible products.',
          'This clause does not exclude rights relating to materially defective, incorrect, counterfeit, or misrepresented products under applicable law.',
        ],
      },
      {
        title: '10. Combining Pre-Orders With Ready Stock',
        blocks: [
          'If a customer purchases ready-stock products together with pre-ordered products, dispatch arrangements will depend on the terms stated at checkout or communicated by our team.',
          'Ready-stock products may be held until the pre-ordered products arrive if the order is intended to ship together. Alternatively, separate shipments may be arranged where agreed, and additional shipping charges may apply.',
          'Please confirm the shipping arrangement before payment if you want ready-stock items delivered separately.',
        ],
      },
      {
        title: '11. Customer Responsibility',
        blocks: [
          'Before placing a pre-order, customers are responsible for checking:',
          [
            'The model name, variant, scale, and manufacturer.',
            'The product price and required advance payment.',
            'The stated ETA and possibility of delays.',
            'The packaging type, where options are available.',
            'The reference images and possibility of final-product variations.',
            'The cancellation and refund conditions.',
          ],
          'Please ensure that your contact details are accurate so that we can communicate important updates regarding your booking.',
        ],
      },
      {
        title: '12. Updates & Communication',
        blocks: [
          'We will share relevant pre-order updates when information is received from our manufacturers, suppliers, or distributors.',
          'However, we may not have access to continuous production updates, and we cannot provide a guaranteed update schedule for every product.',
          'Customers are welcome to contact us through our official WhatsApp channel for available information regarding their bookings.',
        ],
      },
      {
        title: '13. Acceptance of This Policy',
        blocks: [
          'By placing a pre-order through Diecast Heaven Udaipur, you acknowledge that:',
          [
            'The product may not be immediately available.',
            'The stated ETA is an estimate and not a guarantee.',
            'The final product may have manufacturer-approved variations.',
            'Supply and allocation are subject to the manufacturer and distributor.',
            'Cancellation and refund requests will be handled according to this policy and applicable law.',
          ],
          'We encourage all customers to read the complete product listing and pre-order terms before making a payment.',
        ],
      },
    ],
    outro: [ADDRESS],
  },
]
