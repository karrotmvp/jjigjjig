/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import AroundSlide from "./AroundSlide";
import MapView, { Pin } from "../../Components/MapView";
import PinSlider from "../../Components/PinSlider";
import { Close, MapBack, NoSearch, Search, SearchClose } from "../../assets";
import { PlaceType } from "../../Shared/type";
import { useRecoilValue } from "recoil";
import { Installed, RegionId } from "../../Shared/atom";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  flexCenter,
  input,
  theme,
  WrapperWithFooter,
} from "../../styles/theme";
import { Mixpanel } from "../../utils/mixpanel";
import { handleClose } from "../../utils/preset";
import { useGetRegion } from "../../api/region";
import useInput from "../../Hooks/useInput";
import { useGetAroundPlaces, useGetSearch } from "../../api/place";
import useDebounce from "../../Hooks/useDebounce";
import NoSearchBox from "../../Components/NoSearchResult/NoSearchBox";
import PlaceList from "./PlaceList";

const Around = () => {
  const installed = useRecoilValue(Installed);
  const [isMapShown, setIsMapShown] = useState(false);
  const regionId = useRecoilValue(RegionId);
  const { data: regionName } = useGetRegion(regionId);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.3595704,
    lng: 127.105399,
  });

  const [aroundPins, setAroundPins] = useState<Pin[] | []>([]);
  const { data: aroundPlaces } = useGetAroundPlaces(regionId);

  useEffect(() => {
    const _aroundPlaces: Pin[] = [];
    aroundPlaces?.places?.forEach((place) => {
      _aroundPlaces.push({
        id: place.placeId,
        placeId: place.placeId,
        name: place.name,
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
      });
    });
    setAroundPins(_aroundPlaces);
    setCenter({
      lat: aroundPlaces?.coordinates.latitude ?? 0,
      lng: aroundPlaces?.coordinates.longitude ?? 0,
    });
  }, [aroundPlaces]);

  // 핀 선택
  const [isPinSelected, setIsPinSelected] = useState(false);
  const handleSelectPin = (pin: Pin, idx: number) => {
    setIsPinSelected(true);
    setCenter({
      lat: pin.latitude,
      lng: pin.longitude,
    });
    setCurrent(idx);
  };

  // 카드 이동
  const [current, setCurrent] = useState(-1);
  useEffect(() => {
    setCenter({
      lat: aroundPins[current]?.latitude,
      lng: aroundPins[current]?.longitude,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // scroll up
  const [isScrollUp, setIsScrollUp] = useState(false);
  useEffect(() => {
    if (!isPinSelected) {
      const targetElement = document.querySelector("#around-scroll")!;

      const onScroll = () => {
        setIsScrollUp(window.innerHeight - targetElement.scrollTop < 450);
        setIsMapShown(targetElement.scrollTop <= 0);
      };
      targetElement.addEventListener("scroll", onScroll);
      return () => targetElement.removeEventListener("scroll", onScroll);
    }
  }, [isPinSelected]);

  const handleBack = () => {
    setCenter({ lat: 0, lng: 0 });
    setIsPinSelected(false);
    setCurrent(-1);
    setIsMapShown(false);
  };

  useEffect(() => {
    Mixpanel.track("둘러보기 진입");
  }, []);

  // 검색
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

  return (
    <Wrapper>
      {isPinSelected ? (
        <div className="map-back" onClick={handleBack}>
          <MapBack />
        </div>
      ) : (
        <>
          <Header title={regionName}>
            <Close
              className="left-icon"
              onClick={() => handleClose(installed)}
            />
          </Header>
          <div className="search-box">
            <Search className="search-icon" />
            <SearchInput
              value={searchVal.value}
              onChange={searchVal.onChange}
              placeholder="우리 동네 가게를 검색해봐요"
            />
            {searchVal.value.length > 0 && (
              <SearchClose
                className="search-close"
                onClick={() => searchVal.setValue("")}
              />
            )}
          </div>
        </>
      )}

      <div onClick={() => setIsMapShown(true)}>
        <MapView
          mapId="around"
          height="100vh"
          pins={aroundPins}
          handleSelectPin={handleSelectPin}
          center={center!}
        />
      </div>

      {!isPinSelected ? (
        <>
          <AroundScroll
            id="around-scroll"
            $isMapShown={isMapShown}
            onClick={() => setIsMapShown(true)}
          >
            {aroundPlaces && (
              <AroundSlide
                {...{ isScrollUp, setIsMapShown }}
                places={aroundPlaces.places}
              />
            )}
          </AroundScroll>
          <Footer />
        </>
      ) : (
        current > -1 &&
        aroundPlaces && (
          <PinSlider
            placeCardType="map"
            {...{ current, setCurrent, setCenter }}
            pins={aroundPlaces.places}
          />
        )
      )}

      {searchVal.value.length > 0 &&
        (result.length > 0 ? (
          <div id="around-search-list">
            <InfiniteScroll
              dataLength={result.length}
              next={handleResultNext}
              hasMore={resultHasMore}
              loader={<div />}
              scrollableTarget="around-search-list"
            >
              <PlaceList places={result} isResult={true} />
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
        ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .map-back {
    ${flexCenter};
    position: fixed;
    top: 0.8rem;
    left: 0.8rem;
    z-index: 800;
    width: 3.4rem;
    height: 3.4rem;
    border-radius: 50%;
    background-color: #fff;
    border: 0.1rem solid ${theme.color.gray3};
  }
  .search-box {
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
    padding: 1.6rem 2rem;
    padding-top: 0.8rem;
    position: sticky;
    top: 5rem;
    background-color: #fff;
    z-index: 90;
    .search-icon {
      position: absolute;
      top: 1.7rem;
      left: 2.8rem;
    }
    .search-close {
      position: absolute;
      right: 1.358rem;
      top: 0.4rem;
      fill: ${theme.color.gray2_5};
    }
  }
  #around-search-list {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    padding-top: 10rem;
    overflow-y: scroll;
    box-sizing: border-box;
    padding-bottom: 8rem;
    background-color: #fff;
  }
  .places {
    margin-top: 2rem;
    & > div:not(:first-child) {
      border-top: 0.1rem solid ${theme.color.gray1_7};
    }
  }
  .no-search {
    ${flexCenter};
    background-color: #fff;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
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

const AroundScroll = styled.div<{ $isMapShown: boolean }>`
  ${WrapperWithFooter};
  padding-bottom: 0;
  transition: 0.5s;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow-y: scroll;
  margin-top: ${({ $isMapShown }) => ($isMapShown ? "calc(100vh - 11rem)" : 0)};
  padding-top: ${({ $isMapShown }) =>
    $isMapShown ? 0 : "calc(100vh - 42rem)"};
`;

const SearchInput = styled.input`
  ${input};
  border: none;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 135%;
  color: ${theme.color.gray7};
  &:focus {
    border: none;
  }
  width: 100%;
  padding: 1.1rem 4.7rem 1.1rem 3.8rem;
  box-sizing: border-box;
  height: 4.2rem;
  background-color: ${theme.color.gray1_5};
  border-radius: 0.8rem;
`;

export default Around;
