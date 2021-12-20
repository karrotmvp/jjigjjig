/* eslint-disable react-hooks/exhaustive-deps */
import { ChangeEvent, useEffect, useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { postPost, putPost } from "../../api/post";
import { Close, Plus } from "../../assets";
import Alert from "../../Components/Alert";
import Header from "../../Components/Header";
import useInput from "../../Hooks/useInput";
import {
  DetailId,
  PageBeforeWrite,
  PostToEdit,
  RegionId,
  ViewerInfo,
} from "../../Shared/atom";
import { PlaceType } from "../../Shared/type";
import {
  Button,
  ButtonFooter,
  flexCenter,
  gap,
  input,
  SubmitBtn,
  theme,
  Title,
  WrapperWithHeader,
} from "../../styles/theme";
import { Mixpanel } from "../../utils/mixpanel";
import { funcNeedLogin } from "../../utils/preset";
import SearchPlace from "./SearchPlace";

const Write = () => {
  const history = useHistory();
  const setDetailId = useSetRecoilState(DetailId);

  // 상세 -> 수정
  useEffect(() => {
    setDetailId([]);
  }, []);

  const { isExact: isWrite } =
    useRouteMatch({
      path: "/write",
    }) ?? {};

  const pageBeforeWrite = useRecoilValue(PageBeforeWrite);

  // SearchPlace
  const [isSearchOpened, setIsSearchOpened] = useState(false);

  const [isShare, setIsShare] = useState<boolean>(true);
  const [places, setPlaces] = useState<PlaceType[] | []>([]);

  // remove place
  const handleRemovePlace = (place: PlaceType) => {
    const idx = places.findIndex((p) => p.placeId === place.placeId);
    const newPlaces = [
      ...places.slice(0, idx),
      ...places.slice(idx + 1, places.length),
    ];
    setPlaces(newPlaces);
  };

  // input
  const inputVal = useInput("");
  const [isInputOver, setIsInputOver] = useState(false);
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // textarea autosize
    e.target.style.height = "5rem";
    e.target.style.height = e.target.scrollHeight + "px";

    inputVal.setValue(e.target.value);
    if (e.target.value.length > 30) {
      setIsInputOver(true);
    } else {
      setIsInputOver(false);
    }
  };

  // textarea
  const textareaVal = useInput("");
  const [isTextareaOver, setIsTextareaOver] = useState(false);
  const handleTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // textarea autosize
    e.target.style.height = "15rem";
    e.target.style.height = e.target.scrollHeight + "px";

    textareaVal.setValue(e.target.value);
    if (e.target.value.length > 100) {
      setIsTextareaOver(true);
    } else {
      setIsTextareaOver(false);
    }
  };

  // 수정
  const postId = parseInt(useParams<{ postId: string }>().postId) ?? null;
  const postToEdit = useRecoilValue(PostToEdit);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isWrite && postToEdit) {
      inputVal.setValue(postToEdit.title);
      textareaVal.setValue(postToEdit.contents);
      setIsShare(postToEdit.share);
      setPlaces(postToEdit.pins.map((pin) => pin.place));
    }
  }, []);

  // 완료
  const [isSubmitable, setIsSubmittable] = useState(false);
  useEffect(() => {
    if (
      inputVal.value &&
      !isInputOver &&
      !isTextareaOver &&
      isShare !== null &&
      places.length > 0
    ) {
      setIsSubmittable(true);
    }
  }, [inputVal.value, isInputOver, isTextareaOver, isShare, places]);

  const [isEditAlertOpened, setIsEditAlertOpened] = useState(false);
  const [isWriteAlertOpened, setIsWriteAlertOpened] = useState(false);

  // close
  const handleClose = () => {
    if (isWrite) {
      setIsWriteAlertOpened(true);
    } else {
      setIsEditAlertOpened(true);
    }
  };

  const regionId = useRecoilValue(RegionId);
  const setViewerInfo = useSetRecoilState(ViewerInfo);

  let submitFlag = false;

  const submitCheck = () => {
    if (submitFlag) {
      return submitFlag;
    } else {
      submitFlag = true;
      return false;
    }
  };

  const handleSubmit = async () => {
    if (submitCheck()) return;

    funcNeedLogin({
      ...{
        setViewerInfo,
        regionId,
        afterFunc: async () => {
          Mixpanel.track("글작성 - 작성 완료");
          const body = {
            title: inputVal.value,
            contents: textareaVal.value,
            regionId,
            share: isShare as boolean,
            pins: places.map((place) => {
              return {
                placeId: place.placeId,
                latitude: place.coordinates.latitude,
                longitude: place.coordinates.longitude,
              };
            }),
          };
          if (isWrite) {
            const data = await postPost(body);
            if (data.postId) {
              history.push(`/detail/${data.postId}/finish`);
            }
          } else {
            const data = await putPost(postId!, body);
            if (data) history.push(`/detail/${postId}/finish`);
          }
        },
      },
    });
  };

  return (
    <Wrapper>
      <Header
        title={isWrite ? "테마 만들기" : "테마 수정"}
        className="write-header"
      >
        <Close onClick={handleClose} className="left-icon" />
      </Header>
      <Title>{`추천하는 동네 가게를
이웃에게도 알려주세요`}</Title>

      <div className="subtitle" style={{ marginTop: "3.1rem" }}>
        만들고 싶은 테마 이름을 입력해 주세요.
      </div>
      <div className="name-input">
        <Input
          $error={isInputOver}
          // maxLength={30}
          onInput={handleInput}
          placeholder="예) 나만 알고있던 혼밥하기 좋은 식당"
          value={inputVal.value}
          onFocus={() => Mixpanel.track("글작성 - 제목 포커스")}
        />
        {isInputOver && (
          <div className="error">공백을 포함해 최대 30글자로 작성해주세요</div>
        )}
      </div>

      <div className="subtitle">지도에 저장할 가게를 추가해 주세요.</div>
      <div className="explanation">최대 10개 가게를 추가할 수 있어요.</div>

      {/* 추가된 가게들 */}
      <div style={{ marginTop: "1.2rem" }}>
        {places?.map((place) => (
          <AddedList key={place.placeId} isImgExist={place.images.length > 0}>
            {place.images.length > 0 && (
              <img
                className="photo"
                alt="thumbnail"
                src={place.images[0].thumbnail}
              />
            )}
            <div className="">{place.name}</div>
            <Close
              onClick={() => handleRemovePlace(place)}
              className="del-btn"
            />
          </AddedList>
        ))}
      </div>

      {places.length < 10 && (
        <div className="add-button" onClick={() => setIsSearchOpened(true)}>
          <Plus className="add-icon" />
          가게 추가
        </div>
      )}

      {(isSearchOpened || pageBeforeWrite === "emptyTheme") && (
        <SearchPlace
          {...{ setIsSearchOpened, places, setPlaces }}
          close={() => setIsSearchOpened(false)}
        />
      )}

      <div className="subtitle">
        테마에 대한 설명을 작성해 주세요.<span>(선택)</span>
      </div>
      <div className="name-input">
        <Textarea
          $error={isTextareaOver}
          rows={2}
          // maxLength={100}
          onInput={handleTextarea}
          placeholder="예) 약속은 없지만, 밖에서 밥을 먹고 싶을 때 자주 찾는 곳들을 모았어요. 혼자 가도 눈치 보이지 않는 식당 모음이에요."
          value={textareaVal.value}
          onFocus={() => Mixpanel.track("글작성 - 설명 포커스")}
        />
        {isTextareaOver && (
          <div className="error">공백을 포함해 최대 100글자로 작성해주세요</div>
        )}
      </div>

      <div className="subtitle">동네 이웃에게 만든 테마를 공개할까요?</div>
      <div className="explanation">
        테마를 공개하면 서로 더 많은 정보를 나눌 수 있어요.
      </div>
      <div className="select-buttons">
        <SelectBtn
          onClick={() => setIsShare(true)}
          $isSelected={isShare === true}
        >
          공개하기
        </SelectBtn>
        <SelectBtn
          onClick={() => setIsShare(false)}
          $isSelected={isShare === false}
        >
          나만보기
        </SelectBtn>
      </div>

      {isEditAlertOpened && (
        <Alert
          close={() => setIsEditAlertOpened(false)}
          title="수정한 내용이 저장되지 않았어요!"
          sub="수정한 내용을 저장할까요?"
        >
          <Button className="white" onClick={() => window.history.back()}>
            나가기
          </Button>
          <Button
            onClick={() => {
              isSubmitable && handleSubmit();
            }}
          >
            저장하기
          </Button>
        </Alert>
      )}

      {isWriteAlertOpened && (
        <Alert
          close={() => setIsWriteAlertOpened(false)}
          title="다음에 만드시겠어요?"
          sub="나가면 지금 만들던 테마는 저장되지 않아요."
        >
          <Button
            className="white"
            onClick={() => setIsWriteAlertOpened(false)}
          >
            이어서 만들기
          </Button>
          <Button onClick={() => window.history.back()}>나가기</Button>
        </Alert>
      )}

      <ButtonFooter>
        <SubmitBtn
          onClick={() => {
            isSubmitable && handleSubmit();
          }}
          $disabled={!isSubmitable}
        >
          {isWrite ? "만들기" : "수정 완료"}
        </SubmitBtn>
      </ButtonFooter>
    </Wrapper>
  );
};

const AddedList = styled.div<{ isImgExist: boolean }>`
  display: flex;
  align-items: center;
  border-radius: 1rem;
  height: 5.2rem;
  border: 1px solid ${theme.color.gray3};
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 2.2rem;
  margin-top: 0.8rem;
  padding: 0 0.6rem;
  padding-left: ${({ isImgExist }) => !isImgExist && "1.6rem"};

  .photo {
    min-width: 4rem;
    height: 4rem;
    border-radius: 0.8rem;
    background-color: lightgray;
    margin-right: 1rem;
  }
  .del-btn {
    margin-left: auto;
    fill: ${theme.color.gray4};
  }
`;

const Wrapper = styled.div`
  ${WrapperWithHeader};
  padding-top: 7.3rem;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 13.2rem;
  overflow: scroll;
  .write-header {
    z-index: 0;
  }
  .error {
    color: ${theme.color.red};
    font-weight: 500;
    font-size: 1.3rem;
    line-height: 160%;
    padding-top: 0.2rem;
  }
  .name-input {
    margin-top: 1.2rem;
  }
  .add-button {
    ${flexCenter};
    position: relative;
    border-radius: 1rem;
    height: 5rem;
    border: 0.1rem dashed ${theme.color.orange};
    font-size: 1.4rem;
    line-height: 135%;
    font-weight: 500;
    margin-top: 0.8rem;
    color: ${theme.color.orange};
    .add-icon {
      position: absolute;
      top: 0;
      left: 0;
      fill: ${theme.color.orange};
    }
  }
  .subtitle {
    font-size: 1.4rem;
    line-height: 120%;
    font-weight: bold;
    margin-top: 3.4rem;
    color: ${theme.color.gray7};
    span {
      margin-left: 0.3rem;
      color: ${theme.color.gray5};
      font-weight: normal;
    }
  }
  .explanation {
    margin-top: 0.4rem;
    font-size: 1.4rem;
    line-height: 160%;
    color: ${theme.color.gray6};
  }
  .select-buttons {
    width: 100%;
    display: flex;
    ${gap("0.8rem")};
    margin-top: 1.2rem;
    box-sizing: border-box;
  }
`;

const SelectBtn = styled.div<{ $isSelected: boolean }>`
  ${flexCenter};
  padding: 1.4rem;
  border: 0.1rem solid
    ${({ $isSelected }) =>
      $isSelected ? theme.color.orange : theme.color.gray2};
  background: ${({ $isSelected }) => $isSelected && "rgba(255, 121, 100, 0.1)"};
  box-sizing: border-box;
  border-radius: 1rem;
  font-size: 1.4rem;
  line-height: 135%;
  width: 100%;
  font-weight: 500;
  color: ${({ $isSelected }) =>
    $isSelected ? theme.color.orange : theme.color.gray7};
`;

const Input = styled.textarea<{ $error?: boolean }>`
  ${input};
  height: 5.4rem;
  border: 0.1rem solid
    ${({ $error }) => (!$error ? theme.color.gray2 : theme.color.red)};
  background-color: ${theme.color.gray1};
  &:focus {
    border: 0.1rem solid
      ${({ $error }) => (!$error ? theme.color.gray4 : theme.color.red)};
  }
`;

const Textarea = styled.textarea<{ $error?: boolean }>`
  ${input};
  height: 14.8rem;
  border: 0.1rem solid
    ${({ $error }) => (!$error ? theme.color.gray2 : theme.color.red)};
  background-color: ${theme.color.gray1};
  &:focus {
    border: 0.1rem solid
      ${({ $error }) => (!$error ? theme.color.gray4 : theme.color.red)};
  }
`;

export default Write;
