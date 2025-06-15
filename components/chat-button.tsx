// IconButton.tsx
import * as React from "react";
import { Button } from "./ui/button";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ElementType<any>;
  iconProps?: React.ComponentProps<any>;
  tabIndex?: number;
};

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  iconProps,
  tabIndex = -1,
  ...props
}) => (
  <Button variant="ghost" size="icon" tabIndex={tabIndex} {...props}>
    <Icon {...iconProps} />
  </Button>
);

export default IconButton;
