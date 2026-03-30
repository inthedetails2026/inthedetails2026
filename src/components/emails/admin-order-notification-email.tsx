import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import * as React from "react"

interface AdminOrderNotificationEmailProps {
  orderId: string
  customerName: string
  customerEmail: string
  totalAmount: string
  time: string
  deliveryAddress: {
    line1: string
    line2?: string | null
    city: string
    state: string
    country: string
    postalCode: string
    phone?: string | null
  }
  items: {
    name: string
    quantity: number
    price: string
  }[]
}

export default function AdminOrderNotificationEmail({
  orderId,
  customerName,
  customerEmail,
  totalAmount,
  time,
  deliveryAddress,
  items,
}: AdminOrderNotificationEmailProps) {
  const previewText = `New order from ${customerName}!`

  return (
    <Html>
      <Head>
        <title>New Order - Into The Details</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto bg-white font-sans text-zinc-900">
          <Container className="mx-auto my-[40px] max-w-2xl border border-solid border-zinc-200 p-8">
            <Section className="mt-4">
              <Heading className="text-2xl font-bold tracking-tight">
                New Order Received! 🚀
              </Heading>
              <Text className="text-zinc-500">Order ID: {orderId}</Text>
              <Text className="text-zinc-500 font-mono text-xs italic opacity-80">Placed at: {time}</Text>
            </Section>
            
            <Hr className="my-8 border-zinc-200" />
            
            <Section>
              <Heading className="text-lg font-semibold">
                Customer Information
              </Heading>
              <Text className="mt-2 text-sm leading-6">
                **Name:** {customerName} <br />
                **Email:** {customerEmail} <br />
                **Phone:** {deliveryAddress.phone && deliveryAddress.phone.length > 0 ? deliveryAddress.phone : "N/A"}
              </Text>
            </Section>

            <Section className="mt-6">
              <Heading className="text-lg font-semibold border-b border-zinc-200 pb-2">
                Delivery Address
              </Heading>
              <Text className="mt-2 text-sm leading-6">
                {deliveryAddress.line1} <br />
                {deliveryAddress.line2 && <>{deliveryAddress.line2} <br /></>}
                {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postalCode} <br />
                {deliveryAddress.country}
              </Text>
            </Section>

            <Section className="mt-8">
              <Heading className="text-lg font-semibold border-b border-zinc-200 pb-2">
                Order Items
              </Heading>
              {items.map((item, index) => (
                <div key={index} className="flex justify-between py-4 border-b border-zinc-100 last:border-0 text-sm">
                  <div className="flex-1">
                    <Text className="m-0 font-medium">{item.name}</Text>
                    <Text className="m-0 text-zinc-500">Quantity: {item.quantity}</Text>
                  </div>
                  <div className="text-right">
                    <Text className="m-0 font-medium">${item.price}</Text>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 flex justify-between font-bold text-lg">
                <Text className="m-0">Total</Text>
                <Text className="m-0">${totalAmount}</Text>
              </div>
            </Section>

            <Section className="mt-12 text-center text-zinc-400">
              <Text className="text-xs uppercase tracking-widest">
                Admin Notification System
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
