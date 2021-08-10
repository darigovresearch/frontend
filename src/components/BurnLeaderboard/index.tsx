import { FC, memo, useState, useCallback } from "react";
import CountUp from "react-countup";
import imageIds from "../../assets/leaderboard-image-ids.json";
import { weiToEth } from "../../utils/metric-utils";
import useSWR from "swr";
import FeePeriodControl, { Timeframe } from "../fee-period-control";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const botContracts = ["0xbf0c5d82748ed81b5794e59055725579911e3e4e"];
const botContractMap = new Set(botContracts);

// Ideally we solve this with etags instead. Can be removed once covid punks have left the leaderboard.
const bustcacheAlts = {
  // Covid Punks
  "0xe4cfae3aa41115cb94cff39bb5dbae8bd0ea9d41":
    "/leaderboard-images/0xe4cfae3aa41115cb94cff39bb5dbae8bd0ea9d41-alt.png",
};

const FeeUser: FC<{
  name?: string;
  detail?: string;
  fees: number;
  id: string;
}> = ({ detail, name, fees, id }) => {
  const isBot = botContractMap.has(id);
  const imgSrc = isBot
    ? "/leaderboard-images/bot.svg"
    : bustcacheAlts[id] !== undefined
    ? bustcacheAlts[id]
    : imageIds.includes(id)
    ? `/leaderboard-images/${id}.png`
    : "/leaderboard-images/question-mark.png";

  return (
    <div className="flex flex-row pt-5 md:pt-6 justify-between items-center hover:opacity-80 fee-block">
      <div className="flex flex-row items-center overflow-hidden">
        <a
          className="flex"
          href={id.startsWith("0x") ? `https://etherscan.io/address/${id}` : ""}
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="w-8 h-8 flex-shrink-0 leaderboard-image"
            src={imgSrc}
            alt=""
          />
          <p className="font-inter text-white pl-4 whitespace-nowrap text-base md:text-lg">
            {name || id}
          </p>
        </a>
        <p className="font-inter font-extralight text-blue-shipcove pl-2 whitespace-nowrap truncate text-base md:text-lg">
          {detail}
        </p>
      </div>
      <p className="font-roboto font-light text-white pl-4 whitespace-nowrap text-base md:text-lg">
        <CountUp
          start={0}
          end={weiToEth(fees)}
          preserveValue={true}
          separator=","
          decimals={2}
          duration={1}
        />{" "}
        <span className="text-blue-spindle font-extralight">ETH</span>
      </p>
    </div>
  );
};

type FeeUser = {
  name: string | undefined;
  detail: string | undefined;
  address: string | undefined;
  image: string | undefined;
  fees: number;
};

type FeeBurner = { fees: string; id: string; name: string };
type LeaderboardUpdate = {
  number: number;
  leaderboard1h: FeeBurner[];
  leaderboard24h: FeeBurner[];
  leaderboard7d: FeeBurner[];
  leaderboard30d: FeeBurner[];
  leaderboardAll: FeeBurner[];
};

const feePeriodToUpdateMap: Record<Timeframe, string> = {
  t1h: "leaderboard1h",
  t24h: "leaderboard24h",
  t7d: "leaderboard7d",
  t30d: "leaderboard30d",
  tAll: "leaderboardAll",
};

const useLeaderboard = () => {
  const { data, error } = useSWR<LeaderboardUpdate>(
    `https://api.ultrasound.money/fees/burn-leaderboard`,
    { refreshInterval: 8000 }
  );

  return {
    leaderboard: {
      leaderboard1h: data?.leaderboard1h,
      leaderboard24h: data?.leaderboard24h,
      leaderboard7d: data?.leaderboard7d,
      leaderboard30d: data?.leaderboard30d,
      leaderboardAll: data?.leaderboardAll,
    },
    isLoading: !error && !data,
    isError: error,
  };
};

const BurnLeaderboard: FC = () => {
  const [feePeriod, setFeePeriod] = useState<Timeframe>("t24h");
  const onSetFeePeriod = useCallback(setFeePeriod, [setFeePeriod]);

  const { leaderboard } = useLeaderboard();
  const selectedLeaderboard: FeeBurner[] | undefined =
    leaderboard && leaderboard[feePeriodToUpdateMap[feePeriod]];

  return (
    <div className="bg-blue-tangaroa w-full rounded-lg p-8 h-full">
      <div className="flex justify-between flex-wrap">
        <p className="font-inter font-light text-blue-shipcove text-xl mb-4 md:mb-0 lg:mb-4 xl:mb-0 md:text-xl">
          burn leaderboard
        </p>
        <FeePeriodControl
          timeframe={feePeriod}
          onSetFeePeriod={onSetFeePeriod}
        />
      </div>
      {selectedLeaderboard === undefined ? (
        <p className="text-lg text-center text-gray-500 pt-16 pb-20">
          loading...
        </p>
      ) : (
        <TransitionGroup
          component={null}
          appear={false}
          enter={true}
          exit={false}
        >
          {selectedLeaderboard.slice(0, 10).map((feeUser) => (
            <CSSTransition
              classNames="fee-block"
              timeout={500}
              key={feeUser.id}
            >
              <FeeUser
                key={feeUser.name}
                name={feeUser.name.split(":")[0]}
                detail={feeUser.name.split(":")[1]}
                id={feeUser.id}
                fees={Number(feeUser.fees)}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}
    </div>
  );
};

export default memo(BurnLeaderboard);
