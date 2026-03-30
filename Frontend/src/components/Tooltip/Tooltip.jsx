import React from "react";
import { cn } from "../utils";
const TooltipContext = React.createContext({
    open: false,
    setOpen: () => { }
});
const TooltipProvider = ({ children }) => {
    return <>{children}</>;
};
const Tooltip = ({ children, open, defaultOpen = false, onOpenChange }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const controlledOpen = open !== undefined ? open : isOpen;
    const handleOpenChange = (newOpen) => {
        if (open === undefined)
            setIsOpen(newOpen);
        onOpenChange?.(newOpen);
    };
    return (<TooltipContext.Provider value={{ open: controlledOpen, setOpen: handleOpenChange }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>);
};
const TooltipTrigger = React.forwardRef(({ onMouseEnter, onMouseLeave, ...props }, ref) => {
    const { setOpen } = React.useContext(TooltipContext);
    return (<button ref={ref} type="button" data-slot="tooltip-trigger" onMouseEnter={(e) => { setOpen(true); onMouseEnter?.(e); }} onMouseLeave={(e) => { setOpen(false); onMouseLeave?.(e); }} {...props}/>);
});
TooltipTrigger.displayName = "TooltipTrigger";
const TooltipContent = React.forwardRef(({ className, ...props }, ref) => {
    const { open } = React.useContext(TooltipContext);
    if (!open)
        return null;
    return (<div ref={ref} data-slot="tooltip-content" className={cn("absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background", className)} {...props}/>);
});
TooltipContent.displayName = "TooltipContent";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
