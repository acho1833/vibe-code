import { Card } from '@/components/ui/card';

type Props = {
    content: string;
};

const UserMessage = ({ content }: Props) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className='rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words'>{content}</Card>
        </div>
    );
};

export default UserMessage;
