import { atom, atomFamily, selectorFamily } from "recoil";
import { getSearch } from "../api/place";
import { getPost } from "../api/post";
import { UserType, PlaceType, PostType } from "./type";

export const Places = atom<PlaceType[]>({
  key: "places",
  default: [],
});

export const RegionId = atom({
  key: "region_id",
  default: "6530459d189b",
});

export const ViewerInfo = atom<UserType>({
  key: "my_info",
  default: {
    userId: "1",
    userName: "team1test",
    regionName: "역삼 1동",
  },
});

export const postDetailAtom = atomFamily({
  key: "postDetailAtom",
  default: selectorFamily<PostType, string>({
    key: "postDetailAtom/selector",
    get: (id) => () => getPost(id),
  }),
});

export const searchAtom = atomFamily({
  key: "searchAtom",
  default: selectorFamily<PlaceType[], { regionId: string; val: string }>({
    key: "searchAtom/selector",
    get:
      ({ regionId, val }) =>
      () =>
        getSearch(regionId, { query: val }),
  }),
});
