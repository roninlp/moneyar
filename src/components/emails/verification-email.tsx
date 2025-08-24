import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  verificationCode: string;
  userName: string;
}

export const VerificationEmail = (props: VerificationEmailProps) => {
  const { verificationCode = "123456", userName = "کاربر عزیز" } = props;

  return (
    <Html lang="fa" dir="rtl">
      <Head />
      <Preview>کد تأیید حساب کاربری مانیار شما</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px] shadow-lg">
            {/* Header */}
            <Section className="mb-[32px] text-center">
              <Heading className="m-0 mb-[8px] font-bold text-[32px] text-gray-900">
                مانیار
              </Heading>
              <Text className="m-0 text-[16px] text-gray-600">
                اپلیکیشن مدیریت مالی هوشمند
              </Text>
            </Section>

            {/* Welcome Message */}
            <Section className="mb-[32px]">
              <Heading className="mb-[16px] font-bold text-[24px] text-gray-900">
                سلام {userName}!
              </Heading>
              <Text className="mb-[16px] text-[16px] text-gray-700 leading-[24px]">
                به مانیار خوش آمدید! برای تکمیل فرآیند ثبت‌نام و فعال‌سازی حساب
                کاربری خود، لطفاً کد تأیید زیر را در اپلیکیشن وارد کنید.
              </Text>
            </Section>

            {/* Verification Code */}
            <Section className="mb-[32px] text-center">
              <div className="mb-[16px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
                <Text className="m-0 mb-[8px] text-[14px] text-gray-600">
                  کد تأیید شما:
                </Text>
                <Text className="m-0 font-bold text-[36px] text-blue-600 tracking-[8px]">
                  {verificationCode}
                </Text>
              </div>
              <Text className="m-0 text-[14px] text-gray-500">
                این کد تا ۱۰ دقیقه دیگر معتبر است
              </Text>
            </Section>

            {/* Instructions */}
            <Section className="mb-[32px]">
              <Text className="mb-[16px] text-[16px] text-gray-700 leading-[24px]">
                <strong>مراحل تأیید:</strong>
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                ۱. اپلیکیشن مانیار را باز کنید
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                ۲. کد تأیید بالا را در قسمت مربوطه وارد کنید
              </Text>
              <Text className="m-0 mb-[16px] text-[14px] text-gray-600 leading-[20px]">
                ۳. روی دکمه "تأیید" کلیک کنید
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="mb-[32px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[16px]">
              <Text className="m-0 text-[14px] text-yellow-800 leading-[20px]">
                <strong>نکته امنیتی:</strong> این کد محرمانه است و آن را با
                هیچ‌کس به اشتراک نگذارید. تیم مانیار هرگز از شما درخواست ارسال کد
                تأیید نخواهد کرد.
              </Text>
            </Section>

            {/* Support */}
            <Section className="mb-[32px]">
              <Text className="mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                اگر این درخواست را شما نکرده‌اید، لطفاً این ایمیل را نادیده
                بگیرید.
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px]">
                در صورت نیاز به کمک، با تیم پشتیبانی مانیار تماس بگیرید.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-gray-200 border-t pt-[24px] text-center">
              <Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
                © ۱۴۰۳ مانیار. تمامی حقوق محفوظ است.
              </Text>
              <Text className="m-0 text-[12px] text-gray-500 leading-[16px]">
                تهران، ایران | پشتیبانی: support@moneyar.ir
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
