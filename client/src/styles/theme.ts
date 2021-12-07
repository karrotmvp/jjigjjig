import styled, { DefaultTheme, css } from "styled-components";

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WrapperWithHeaderFooter = css`
  width: 100%;
  height: 100vh;
  padding-top: 5rem;
  padding-bottom: 6.8rem;
  box-sizing: border-box;
`;
export const WrapperWithHeader = css`
  width: 100%;
  height: 100vh;
  padding-top: 5rem;
  box-sizing: border-box;
`;
export const WrapperWithFooter = css`
  width: 100%;
  height: 100vh;
  padding-bottom: 6.8rem;
  box-sizing: border-box;
`;

export const ButtonFooter = styled.div`
  z-index: 1;
  position: fixed;
  width: 100%;
  height: 7.4rem;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding: 1rem 2rem 1.4rem 2rem;
  box-sizing: border-box;
`;

const calculateMargin = (
  gap: string,
  direction: "row" | "column" | "column-reverse"
) => {
  if (direction === "row") return `margin-left: ${gap}`;
  if (direction === "column") return `margin-top: ${gap}`;
  if (direction === "column-reverse") return `margin-bottom: ${gap}`;
  return "";
};
export const gap = (
  gapLength: string,
  direction: "row" | "column" | "column-reverse" = "row"
) => {
  return css`
    & > * + * {
      ${calculateMargin(gapLength, direction)}
    }
  `;
};

export const theme: DefaultTheme = {
  color: {
    black: "#333333",
    gray7: "#585858",
    gray6: "#767676",
    gray5: "#9C9C9C",
    gray4: "#B4B4B4",
    gray3_5: "#C4C4C4",
    gray3: "#CECECE",
    gray2: "#E5E5E5",
    gray2_5: "#DBDBDB",
    gray1_7: "#F0F0F0",
    gray1_5: "#F7F7F7",
    gray1: "#F8F9FA",
    white: "#FFFFFF",
    orange: "#FF7964",
    orange_light: "#FFF2EF",
    orange_very_light: "#FFF8F7",
    orange_medium: "#FFBCB1",
    red: "#FC453A",
    dark_green: "#09C6A1",
  },
};

export const input = css`
  width: 100%;
  padding: 1.5rem 1.6rem;
  border-radius: 1rem;
  font-size: 1.5rem;
  line-height: 160%;
  box-sizing: border-box;
  color: ${theme.color.gray7};
  border: 0.1rem solid ${theme.color.gray3};
  ::placeholder {
    color: ${theme.color.gray4};
  }
  &:focus {
    border: 0.1rem solid ${theme.color.gray3};
  }
`;

export const Button = styled.div`
  ${flexCenter};
  color: ${theme.color.white};
  padding: 1.5rem 0;
  font-size: 1.5rem;
  border-radius: 1rem;
  font-weight: 500;
  line-height: 135%;
  box-sizing: border-box;
  background-color: ${theme.color.orange};
`;
export const SubmitBtn = styled(Button)<{ $disabled: boolean }>`
  background-color: ${({ $disabled }) =>
    $disabled ? theme.color.gray2 : theme.color.orange};
  color: ${({ $disabled }) =>
    $disabled ? theme.color.gray7 : theme.color.white};
`;

export const Title = styled.div`
  font-weight: 500;
  font-size: 2.1rem;
  line-height: 140%;
  white-space: pre-line;
  letter-spacing: -2%;
  color: ${theme.color.gray7};
`;

export const GrayTag = styled.div`
  font-size: 1.1rem;
  font-weight: 400;
  padding: 0.45rem 1rem;
  border-radius: 0.4rem;
  background-color: ${theme.color.gray1_5};
  color: ${theme.color.gray7};
  white-space: nowrap;
  text-overflow: ellipsis;
  border: 0.1rem solid ${theme.color.gray1_7};
`;
export const OrangeTag = styled.div`
  font-size: 1.1rem;
  font-weight: 400;
  padding: 0.45rem 1rem;
  border-radius: 0.4rem;
  background-color: ${theme.color.white};
  color: ${theme.color.orange};
  white-space: nowrap;
  text-overflow: ellipsis;
`;
