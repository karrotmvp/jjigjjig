/* eslint-disable react-hooks/exhaustive-deps */
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { Back, NoSearch, SearchClose } from "../../assets";
import SearchList from "../../Components/SearchList";
import useDebounce from "../../Hooks/useDebounce";
import useInput from "../../Hooks/useInput";
import { PageBeforeWrite, RegionId } from "../../Shared/atom";
import { PlaceType } from "../../Shared/type";
import { flexCenter, input, theme } from "../../styles/theme";
import PlaceMapView from "./PlaceMapView";
import InfiniteScroll from "react-infinite-scroll-component";
import { Mixpanel } from "../../utils/mixpanel";
import { useHistory } from "react-router";
import { useGetSearch } from "../../api/place";
import NoSearchBox from "../../Components/NoSearchResult/NoSearchBox";

const SearchPlace = ({
  setIsSearchOpened,
  close,
  places,
  setPlaces,
  postIdFromProps,
}: {
  setIsSearchOpened: Dispatch<SetStateAction<boolean>>;
  close: Function;
  places: PlaceType[];
  setPlaces?: Dispatch<SetStateAction<PlaceType[]>>;
  postIdFromProps?: number;
}) => {
  const [isMapOpened, setIsMapOpened] = useState(false);
  const [place, setPlace] = useState<PlaceType | null>(null);
  const regionId = useRecoilValue(RegionId);
  const pageBeforeWrite = useRecoilValue(PageBeforeWrite);
  const history = useHistory();

  const handleOpenMap = (place: PlaceType) => {
    setPlace(place);
    setIsMapOpened(true);
  };

  const searchVal = useInput("");

  const [result, setResult] = useState<PlaceType[] | []>([]);
  const [resultHasMore, setResultHasMore] = useState(true);
  const [resultPage, setResultPage] = useState(1);

  const { refetch: refetchSearchResult } = useGetSearch(regionId, {
    query: searchVal.value,
    page: resultPage,
  });

  const getSearchItems = useCallback(async () => {
    if (searchVal.value.length > 0) {
      const data = await refetchSearchResult();
      setResult(data.data ?? []);
    }
  }, [searchVal.value]);
  const debouncedSearchVal = useDebounce(getSearchItems, 200);

  useEffect(() => {
    setResultPage(1);
    setResultHasMore(true);
    debouncedSearchVal();
  }, [searchVal.value]);

  // 무한 스크롤
  const handleResultNext = () => {
    setResultPage(resultPage + 1);
  };
  useEffect(() => {
    const fetchResult = async () => {
      const data = await refetchSearchResult();
      if (data.data) {
        if (data.data.length < 1) {
          setResultHasMore(false);
        } else {
          setResult([...result, ...data.data]);
        }
      }
    };
    if (searchVal.value.length > 0) {
      fetchResult();
    }
  }, [resultPage]);

  useEffect(() => {
    Mixpanel.track("글작성 - 장소 검색 진입");
  }, []);

  return (
    <Wrapper>
      <PlaceInput>
        <Back
          className="search-back"
          onClick={() =>
            pageBeforeWrite === "emptyTheme" ? history.push("/mypage") : close()
          }
        />
        <SearchInput
          value={searchVal.value}
          onChange={searchVal.onChange}
          placeholder="검색어를 입력해주세요"
          onFocus={() => Mixpanel.track("글작성 - 검색어 포커스")}
        />
        {searchVal.value.length > 0 && (
          <SearchClose
            className="search-close"
            onClick={() => searchVal.setValue("")}
          />
        )}
      </PlaceInput>

      {searchVal.value.length > 0 ? (
        result.length > 0 ? (
          <div id="search-list">
            <InfiniteScroll
              dataLength={result.length}
              next={handleResultNext}
              hasMore={resultHasMore}
              loader={<div />}
              scrollableTarget="search-list"
            >
              {result.map((place, i) => {
                const isExist = places.find((p) => p.placeId === place.placeId)
                  ? true
                  : false;
                return (
                  <div
                    key={`${place.placeId}${i}`}
                    onClick={() => !isExist && handleOpenMap(place)}
                  >
                    <SearchList
                      {...{ isExist, place }}
                      searchVal={searchVal.value}
                    />
                  </div>
                );
              })}
            </InfiniteScroll>
            <NoSearchBox />
          </div>
        ) : (
          <div className="no-search">
            <NoSearch />
            <div>
              <span>{searchVal.value}</span>의 검색 결과가 없어요
            </div>
            <div>검색어를 다시 확인해주세요!</div>
            <NoSearchBox style={{ marginTop: "1.6rem" }} />
          </div>
        )
      ) : (
        <div className="empty">
          <div>저장할 가게의 이름을 검색해보세요</div>
          <div>
            {`내 근처에 있는 가게, 사진관, 공원 등
저장하고 싶은 동네 장소들을 검색하여 찾아볼 수 있어요`}
          </div>
        </div>
      )}

      {isMapOpened && place && (
        <PlaceMapView
          close={() => setIsMapOpened(false)}
          {...{ place, setIsSearchOpened, places, setPlaces, postIdFromProps }}
        />
      )}
    </Wrapper>
  );
};

const PlaceInput = styled.div`
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${theme.color.white};
  z-index: 300;
  .search-back {
    position: absolute;
    top: 0.4rem;
    fill: ${theme.color.gray7};
  }
  .search-close {
    position: absolute;
    right: 0.7rem;
    top: 0.4rem;
    fill: ${theme.color.gray2};
  }
`;

const Wrapper = styled.div`
  position: fixed;
  z-index: 600;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  #search-list {
    padding-top: 8rem;
    box-sizing: border-box;
    font-size: 1.4rem;
    line-height: 160%;
    padding-bottom: 1.3rem;
    height: 100vh;
    overflow-y: scroll;
    & > div > div > div:not(:first-child) {
      border-top: 0.1rem solid lightgray;
    }
  }
  .empty {
    ${flexCenter};
    flex-direction: column;
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    font-weight: 700;
    font-size: 1.7rem;
    line-height: 160%;
    color: ${theme.color.gray7};
    text-align: center;
    & > div:nth-child(2) {
      white-space: pre-line;
      margin-top: 1.6rem;
      color: ${theme.color.gray6};
      font-size: 1.3rem;
      line-height: 170%;
      font-weight: normal;
    }
  }

  .no-search {
    ${flexCenter};
    flex-direction: column;
    width: 100%;
    height: 100vh;
    position: fixed;
    & > div {
      font-size: 1.5rem;
      font-weight: 500;
      line-height: 160%;
      color: ${theme.color.gray6};
      & > span {
        color: ${theme.color.orange};
      }
    }
  }
`;

const SearchInput = styled.input`
  ${input};
  border: none;
  border-radius: 0;
  border-bottom: 0.1rem solid ${theme.color.gray2};
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 135%;
  &:focus {
    border: none;
    border-bottom: 0.1rem solid ${theme.color.gray2};
  }
  width: 100%;
  padding-left: 4.7rem;
  box-sizing: border-box;
  height: 5.6rem;
`;

export default SearchPlace;
