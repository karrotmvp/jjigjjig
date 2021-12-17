import { MouseEventHandler, ReactChild } from "react";
import { useRouteMatch } from "react-router";
import styled from "styled-components";
import { flexCenter, gap, theme } from "../styles/theme";

interface AlertProps {
  close: MouseEventHandler;
  title: string;
  sub?: string;
  children?: ReactChild | ReactChild[];
}

const Alert = ({ close, title, sub, children }: AlertProps) => {
  const fromDetail =
    useRouteMatch({
      path: "/detail/:postId",
    })?.isExact ?? false;

  return (
    <Wrapper onClick={close} {...{ fromDetail }}>
      <div className="background" style={{ zIndex: 700 }} />
      <div className="alert">
        <div className="alert-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="title">{title}</div>
          <div className="sub">{sub}</div>
          <div className="buttons">{children}</div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ fromDetail: boolean }>`
  .alert {
    ${flexCenter};
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    z-index: 700;
    padding: 2rem;
    box-sizing: border-box;
    white-space: pre-line;
    .alert-wrapper {
      width: 100%;
      padding: 2rem;
      border-radius: 1.2rem;
      background-color: ${theme.color.white};
      .title {
        font-size: 1.6rem;
        font-weight: bold;
        line-height: ${({ fromDetail }) => (fromDetail ? "160%" : "135%")};
      }
      .sub {
        font-size: 1.4rem;
        font-weight: 500;
        line-height: 150%;
        color: ${theme.color.gray6};
        margin-top: 0.6rem;
        white-space: pre-line;
      }
      .buttons {
        margin-top: 2.6rem;
        display: flex;
        ${gap("1rem")};
        & > div {
          width: 100%;
        }
        .white {
          background-color: ${theme.color.white};
          color: ${theme.color.gray7};
          border: 0.1rem solid ${theme.color.gray3};
        }
      }
    }
  }
`;

export default Alert;
