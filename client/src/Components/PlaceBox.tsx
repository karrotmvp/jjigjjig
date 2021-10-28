import styled from "styled-components";
import { Call, Time } from "../assets";
import { PlaceType } from "../Shared/type";
import { theme } from "../styles/theme";
import PlaceInfo from "./PlaceInfo";

// 1: 작성하기
// 2: 메인페이지
// 3: 상세페이지
// 4: 둘러보기
export type PlaceBoxType = "type1" | "type2" | "type3" | "type4";

const PlaceBox = ({
  place,
  className,
  type,
}: {
  place: PlaceType;
  className?: string;
  type: PlaceBoxType;
}) => {
  return (
    <Wrapper {...{ className, type }}>
      <div className="wrapper">
        {place.images.length > 0 && (
          <img
            className="photo"
            alt="thumbnail"
            src={place.images[0].thumbnail}
          />
        )}
        <PlaceInfo {...{ place }} />
      </div>

      {type === "type4" && (
        <>
          <div className="sub-info phone">
            <Call />
            <div>010-0000-0000</div>
          </div>
          <div className="sub-info time">
            <Time />
            <div>09:00 - 22:00 연중무휴</div>
          </div>
        </>
      )}

      {(type === "type2" || type === "type4") && (
        <div className="recommend">
          {place.saved}개 리스트에 저장된 장소예요.
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ type: PlaceBoxType }>`
  background-color: ${theme.color.white};
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.15);
  border-radius: 1.2rem;
  padding: ${({ type }) =>
    type === "type1" || type === "type4" ? "1.5rem" : "1.5rem 1.3rem"};
  width: ${({ type }) =>
    type === "type1" || type === "type4" ? "32rem" : "30.3rem"};
  box-sizing: border-box;
  .wrapper {
    display: flex;
  }
  .photo {
    min-width: 10rem;
    height: 10rem;
    border-radius: 0.8rem;
    background-color: lightgray;
    margin-right: 1rem;
  }
  .sub-info {
    display: flex;
    align-items: center;
    font-size: 1.3rem;
    color: ${theme.color.gray6};
    line-height: 145%;
    letter-spacing: -2%;
    & > div {
      margin-left: 1.1rem;
    }
  }
  .phone {
    margin-top: 0.6rem;
  }
  .time {
    margin-top: 0.4rem;
  }
  .recommend {
    font-size: 1.3rem;
    color: ${theme.color.orange};
    letter-spacing: -2%;
    margin-top: ${({ type }) => (type === "type2" ? "0.8rem" : "0.4rem")};
    line-height: 145%;
  }
`;

export default PlaceBox;
