import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type HintProps = {
    children: React.ReactNode;
    text: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
};

const Hint = ({ children, text, side = 'top', align = 'center' }: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
export default Hint;
