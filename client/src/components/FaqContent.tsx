import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from "@/lib/faqData";

export default function FaqContent() {
  return (
    <div className="pt-4">
      <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqData.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-[#00f3ff] border-opacity-30">
            <AccordionTrigger className="text-[#00f3ff] hover:text-[#39FF14] text-left font-medium py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-200 whitespace-pre-line">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}