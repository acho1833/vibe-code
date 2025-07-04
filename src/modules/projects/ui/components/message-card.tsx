'use client';
import { Fragment, MessageRole, MessageType } from '@/generated/prisma';
import UserMessage from './user-message';
import AssistantMessage from './assistant-message';

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
        return <AssistantMessage content={content} fragment={fragment}  createdAt={createdAt}  isActive={isActive}  onFragmentClick={onFragmentClick}  type={type} />;
    }

    return (
        <UserMessage content={content}/>
    );
};

export default MessageCard;
