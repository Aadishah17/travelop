import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-navy md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button asChild variant="gradient">
          <a href={action.href}>{action.label}</a>
        </Button>
      ) : null}
    </div>
  );
}
