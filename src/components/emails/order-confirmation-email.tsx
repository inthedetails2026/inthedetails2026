import * as React from "react"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

interface OrderConfirmationEmailProps {
  orderId: string
  customerName: string
  totalAmount: string
  items: {
    name: string
    quantity: number
    price: string
  }[]
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

export default function OrderConfirmationEmail({
  orderId,
  customerName,
  totalAmount,
  items,
}: OrderConfirmationEmailProps) {
  const previewText = `Thank you for your order, ${customerName}!`

  return (
    <Html>
      <Head>
        <title>Order Confirmation - Into The Details</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto bg-white font-sans text-zinc-900">
          <Container className="mx-auto my-[40px] max-w-2xl border border-solid border-zinc-200 p-8">
            <Section className="mt-4 text-center">
              <Heading className="text-2xl font-bold tracking-tight">
                Into The Details
              </Heading>
              <Text className="text-zinc-500">In The Details</Text>
            </Section>

            <Hr className="my-8 border-zinc-200" />

            <Section>
              <Heading className="text-xl font-semibold">
                Order Confirmed!
              </Heading>
              <Text className="mt-4 text-base leading-6">
                Hi {customerName},
              </Text>
              <Text className="text-base leading-6">
                Thank you for your purchase. We've received your order **
                {orderId}** and are getting it ready for shipment.
              </Text>
              <Text className="text-base font-medium italic leading-6 text-zinc-700">
                We will be in touch with you as soon as possible for the
                delivery.
              </Text>
            </Section>

            <Section className="mt-8">
              <Heading className="border-b border-zinc-200 pb-2 text-lg font-semibold">
                Order Summary
              </Heading>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-zinc-100 py-4 text-sm last:border-0"
                >
                  <div className="flex-1">
                    <Text className="m-0 font-medium">{item.name}</Text>
                    <Text className="m-0 text-zinc-500">
                      Quantity: {item.quantity}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text className="m-0 font-medium">${item.price}</Text>
                  </div>
                </div>
              ))}

              <div className="mt-4 flex justify-between text-lg font-bold">
                <Text className="m-0">Total</Text>
                <Text className="m-0">${totalAmount}</Text>
              </div>
            </Section>

            <Section className="mt-12 text-center text-zinc-500">
              <Text className="text-sm">
                If you have any questions about your order, please reply to this
                email or contact us at{" "}
                <Link
                  href={`mailto:${process.env.EMAIL_FROM_ADDRESS}`}
                  className="text-blue-600 underline"
                >
                  {process.env.EMAIL_FROM_ADDRESS}
                </Link>
              </Text>
              <Text className="mt-6 text-xs uppercase tracking-widest">
                © Into The Details {new Date().getFullYear()}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
