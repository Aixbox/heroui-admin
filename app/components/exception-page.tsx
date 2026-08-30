import { Button } from "@heroui/react";
import { useNavigate } from "react-router";
import { useT } from "~/lib/i18n";

type ExceptionPageProps = {
  code: string;
  title: string;
  description: string;
};

export function ExceptionPage({ code, title, description }: ExceptionPageProps) {
  const navigate = useNavigate();
  const t = useT();
  return (
    <div className="grid place-items-center py-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-8xl font-bold tracking-tighter text-accent/30">{code}</p>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-md text-muted">{description}</p>
        <div className="mt-2 flex gap-3">
          <Button variant="primary" onPress={() => navigate("/app")}>
            {t("返回概览")}
          </Button>
          <Button variant="ghost" onPress={() => navigate(-1)}>
            {t("返回上一页")}
          </Button>
        </div>
      </div>
    </div>
  );
}
