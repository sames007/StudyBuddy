import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

export function FeatureCard({ title, description, href, icon }: FeatureCardProps) {
  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>
            Open Tool <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
