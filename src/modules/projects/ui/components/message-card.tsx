import { Fragment, MessageRole, MessageType } from '@/generated/prisma';

type Props = {
    content: string;
    role: MessageRole;
    fragment: Fragment | null;
    createdAt: Date;
    isActive: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
};

const MessageCard = ({
    content,
    role,
    fragment,
    createdAt,
    isActive,
    onFragmentClick,
    type,
}: Props) => {
    if (role === 'ASSISTANT') {
        return <p>ASSISTANT</p>;
    }

    return (
        <p>
            USER
        </p>
    );
};

export default MessageCard;
