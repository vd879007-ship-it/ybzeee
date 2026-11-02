import { Truck, Tag, Shield, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free shipping on all orders above ₹999. Delivered to your doorstep within 4-7 business days.',
  },
  {
    icon: Tag,
    title: 'Same Price For All Sizes',
    description: 'Enjoy uniform, transparent pricing across all sizes without any extra charges for plus sizes.',
  },
  {
    icon: Shield,
    title: 'Authentic Guaranteed',
    description: '100% authentic products sourced directly from premium brands and verified suppliers.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support ready to assist you with any queries or concerns.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] sm:text-3xl lg:text-4xl">
            Why Choose YEZ BEE?
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl bg-[var(--color-warm-white)] p-6 text-center transition-all duration-300 hover:shadow-luxury"
              >
                <div
                  className={cn(
                    'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300',
                    'bg-[var(--color-champagne)] text-[var(--color-primary-gold)]',
                    'group-hover:bg-[var(--color-primary-gold)] group-hover:text-white'
                  )}
                >
                  <Icon size={24} />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-[var(--color-dark)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-dark)]/60">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
