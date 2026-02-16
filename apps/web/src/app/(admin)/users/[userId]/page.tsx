import { UserDetailContent } from "./user-detail-content";

interface Props {
	params: Promise<{
		userId: string;
	}>;
}

export default async function UserDetailPage({ params }: Props) {
	const { userId } = await params;

	return <UserDetailContent userId={userId} />;
}
