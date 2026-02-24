import { SchemeDetailContent } from "./scheme-detail-content";

interface Props {
	params: Promise<{
		schemeId: string;
	}>;
}

export default async function SchemeDetailPage({ params }: Props) {
	const { schemeId } = await params;

	return <SchemeDetailContent schemeId={schemeId} />;
}
