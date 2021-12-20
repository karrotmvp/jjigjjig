import { Dispatch, SetStateAction, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { deleteSavedPost, postSavedPost } from "../../api/post";
import { Heart, HeartEmpty, Secret } from "../../assets";
import useDebounce from "../../Hooks/useDebounce";
import { PostIsSaved, ViewerInfo, RegionId } from "../../Shared/atom";
import { PostType } from "../../Shared/type";
import { flexCenter, gap, theme } from "../../styles/theme";
import { Mixpanel } from "../../utils/mixpanel";
import { funcNeedLogin } from "../../utils/preset";

interface SaveFooterInterface {
  post: PostType;
  savedPosts?: PostType[];
  setSavedPosts?: Dispatch<SetStateAction<PostType[]>>;
}
const SaveFooter = ({ post }: SaveFooterInterface) => {
  const [isSaved, setIsSaved] = useRecoilState(
    PostIsSaved(post.postId.toString())
  );
  const [savedNum, setSavedNum] = useState<number>(post.savedNum);
  const viewerInfo = useRecoilValue(ViewerInfo);

  const regionId = useRecoilValue(RegionId);
  const setViewerInfo = useSetRecoilState(ViewerInfo);

  const handleSaveToggle = async () => {
    funcNeedLogin({
      ...{
        setViewerInfo,
        regionId,
        afterFunc: async () => {
          setIsSaved(!isSaved);

          // 저장
          if (!isSaved) {
            Mixpanel.track("테마 저장 - 메인");
            await postSavedPost(post.postId);
            if (!post.saved || savedNum - post.savedNum === -1)
              setSavedNum(savedNum + 1);
          }
          // 저장 취소
          else {
            await deleteSavedPost(post.postId);
            if (post.saved || savedNum - post.savedNum === 1)
              setSavedNum(savedNum - 1);
          }
        },
      },
    });
  };
  const debouncedIsSaved = useDebounce(handleSaveToggle, 200);

  const isViewer = post.user.userId === viewerInfo.userId;

  return (
    <Wrapper>
      {!isViewer && (
        <div onClick={(e) => e.stopPropagation()}>
          {isSaved ? (
            <Heart onClick={debouncedIsSaved} />
          ) : (
            <HeartEmpty onClick={debouncedIsSaved} />
          )}
        </div>
      )}
      <div className="saved-info">
        {isViewer ? (
          post.share ? (
            savedNum > 0 ? (
              <div>
                <span>{savedNum}명</span> 이웃이 좋아하는 테마예요
              </div>
            ) : (
              "아직 좋아한 이웃이 없어요"
            )
          ) : (
            <div className="secret">
              <Secret />
              <div>나만 볼 수 있는 테마예요</div>
            </div>
          )
        ) : savedNum > 0 ? (
          <div>
            <span>{savedNum}명</span> 이웃이 좋아하는 테마예요
          </div>
        ) : (
          "가장 먼저 좋아해 보세요!"
        )}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.2rem;
  height: 3.2rem;
  gap: 0.922rem;
  padding: 0 2rem;
  .saved-info {
    color: ${theme.color.gray6};
    font-size: 1.4rem;
    font-weight: 500;
    line-height: 145%;
    span {
      font-weight: bold;
      color: ${theme.color.orange};
    }
  }
  .secret {
    ${flexCenter};
    ${gap("1.2rem")};
  }
`;

export default SaveFooter;
