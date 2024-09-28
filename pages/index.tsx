import React, { useState } from "react";
import Layout from "@/components/Layout";
import { MediaRenderer } from "thirdweb/react";
import { client } from "@/utils/configs";
import {
  useGetUserTokensQuery,
  useGetUserNFTsQuery,
  useGetTokenTransfersQuery,
  useGetNFTsTransfersQuery,
  useUserChainInfo,
} from "@/modules/query";
import { decimalOffChain, getFormatAddress, stringFormat } from "@/utils";
import {
  DollarSign,
  ImageIcon,
  ArrowUpDownIcon,
  ExternalLinkIcon,
  CoinsIcon,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { NFTDialog } from "@/components/NFTModal";
import { NFTActivity } from "@/utils/types";
import { ScrollArea } from "@/modules/app/scroll-area/scroll-area";
import { cn } from "@/modules/utils";
import Image from "next/image";
import { Dialog } from "@/modules/app/dialog";
import { Title } from "@/modules/app/title/title";

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    className={cn(
      "px-2 py-2 text-sm flex gap-1.5 text-muted-foreground font-medium duration-500 ease-in-out transition-colors border-b-2 border-transparent !rounded-none",

      {
        "text-foreground border-sec-btn": active,
        "hover:border-muted-foreground/50  hover:text-foreground": !active,
      }
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

const tabs = [
  {
    key: "tokens",
    label: "Tokens",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    key: "nfts",
    label: "NFTs",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    key: "tokenTransfers",
    label: "Token Transfers",
    icon: <ArrowUpDown className="w-5 h-5" />,
  },
  {
    key: "nftTransfers",
    label: "NFT Transfers",
    icon: <ArrowUpDown className="w-5 h-5" />,
  },
];
export default function Home() {
  const [activeTab, setActiveTab] = useState("tokens");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { activeAccount } = useUserChainInfo();
  const owner = activeAccount?.address;
  // const wallet = "0x1FFE2134c82D07227715af2A12D1406165A305BF";
  const { data: tokenData, isLoading:tableLoading } = useGetUserTokensQuery();
  const { data: nftData } = useGetUserNFTsQuery();
  const { data: tokenTransfers } = useGetTokenTransfersQuery();
  const { data: nftTransfers } = useGetNFTsTransfersQuery();

  const groupTransfersByDate = (transfers: Partial<NFTActivity>[]) => {
    return transfers.reduce((acc, transfer) => {
      if (transfer.timestamp) {
        const date = new Date(transfer.timestamp).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transfer);
        return acc;
      }
      return acc;
    }, {} as Record<string, any>);
  };

  const groupedTokenTransfers = groupTransfersByDate(tokenTransfers || []);
  const groupedNFTTransfers = groupTransfersByDate(nftTransfers || []);

  return (
    <Layout>
      <div
        className={cn(
          "mb-6 flex items-center justify-between bg-[#18181A] w-full z-40 absolute top-0",
          { "justify-end": !owner }
        )}
      >
        {owner && (
          <div className="flex items-center justify-between  space-x-2 mb-4">
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </TabButton>
            ))}
          </div>
        )}
      </div>
      <div className="bg-gradient-to-b absolute top-10 from-[#18181A] z-30 via-[#18181A] to-transparent w-full h-8" />

      {owner ? (
        <ScrollArea.Root className="pt-16">
          {activeTab === "tokens" && (
            <div className="w-full h-full">
              {!tokenData || tokenData.length === 0 ? (
                <Placeholder text="You do not own any tokens yet." />
              ) : (
                <>
                  <Title title="Your Tokens" />
                  <table className="w-full !font-inter bg-new-secondary p-4 rounded-lg">
                    <thead className="border-b border-b-new-elements-border pb-4">
                      <tr className="text-left rounded-tl-md rounded-tr-md">
                        <th className="p-2 rounded-tl-lg text-muted-foreground text-sm !font-inter">
                          Token
                        </th>
                        <th className="p-2 text-muted-foreground text-sm !font-inter">
                          Balance
                        </th>
                        <th className="p-2 rounded-tr-lg text-muted-foreground text-sm !font-inter">
                          Token Type
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody className="px-6">
                      {tokenData.map((token, index) => (
                        <tr
                          key={index}
                          className="bg-transparent px-4 hover:bg-new-terciary cursor-pointer rounded-lg transition-colors duration-300 ease-in-out"
                        >
                          <td className="p-4 flex items-center">
                            <CoinsIcon className="w-4 h-4 mr-2" />
                            <div>
                              <div className="font-bold">
                                {token.tokenSymbol || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-400">
                                {token.tokenName || "Unknown"}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            {stringFormat(
                              decimalOffChain(token.balance, token.decimals)
                            )}{" "}
                            {token.tokenSymbol}
                            <div className="text-sm text-gray-400">
                              No $USD value
                            </div>
                          </td>
                          <td className="py-4">
                            {token.tokenType || "Unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
          {activeTab === "nfts" && (
            <div>
              {!nftData || nftData.length === 0 ? (
                <Placeholder text="No NFT Found" />
              ) : (
                <>
                  <Title title="Your NFTs" />
                  <Dialog.Root>
                    <Dialog.Trigger>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {nftData.map((nft, index) => {
                          const imageUrl =
                            nft.nft.metadata.image?.replace(
                              "ipfs://",
                              "https://ipfs.io/ipfs/"
                            ) || "/logo.svg";
                          return (
                            <>
                              <div
                                key={index}
                                // @ts-ignore
                                onClick={() => setSelectedNFT(nft)}
                                className="w-full h-full overflow-hidden group relative rounded-2xl cursor-pointer !max-h-[250px]"
                              >
                                <Image
                                  src={imageUrl}
                                  alt={nft.nft.metadata.name || "NFT"}
                                  width={1000}
                                  height={1000}
                                  className="rounded-2xl group-hover:scale-105 transition-all duration-300 ease-in-out brightness-75"
                                />
                              </div>
                            </>
                          );
                        })}
                      </div>
                    </Dialog.Trigger>
                    <Dialog.Content className="max-w-[690px] w-full p-6">
                      <NFTDialog nft={selectedNFT} />
                    </Dialog.Content>
                  </Dialog.Root>
                </>
              )}
            </div>
          )}

          {activeTab === "tokenTransfers" && (
            <>
              {!tokenTransfers || tokenTransfers.length === 0 ? (
                <Placeholder text="You haven't made any token transfers yet." />
              ) : (
                <div>
                  <Title title="Your Token Transfers" />
                  {Object.entries(groupedTokenTransfers).map(
                    ([date, transfers]) => (
                      <div key={date} className="mb-6">
                        <h3 className="text-base font-medium text-muted-foreground mb-2">
                          {date}
                        </h3>
                        <div className="flex flex-wrap flex-shrink items-center gap-6 w-full">
                          {transfers &&
                            // @ts-ignore
                            transfers.map((transfer, index) => (
                              <div
                                key={transfer.id || index}
                                className="bg-background/50 border border-dialog-border p-3 rounded-lg flex w-[300px] items-center justify-between"
                              >
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`p-2 rounded-full ${
                                      transfer.type === "send"
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                    }`}
                                  >
                                    <ArrowUpDownIcon className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">
                                      {transfer.type === "send"
                                        ? "Sent"
                                        : "Received"}{" "}
                                      {transfer.amount} {transfer.tokenSymbol}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {transfer.type === "send" ? "To" : "From"}
                                      :{" "}
                                      {getFormatAddress(
                                        transfer.type === "send"
                                          ? transfer.addressTo
                                          : transfer.addressFrom
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <Link
                                  href={`https://test.xfiscan.com/tx/${transfer.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLinkIcon className="w-5 h-5 text-sec-btn hover:text-sec-btn/85 transition-colors duration-300 ease-in-out" />
                                </Link>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
          {activeTab === "nftTransfers" && (
            <>
              {!nftTransfers || nftTransfers.length === 0 ? (
                <Placeholder text="You haven't made any NFT transfer yet." />
              ) : (
                <div className="w-full">
                  <Title title="Your NFT Transfers" />
                  {Object.entries(groupedNFTTransfers).map(
                    ([date, transfers]) => (
                      <div key={date} className="mb-6">
                        <h3 className="text-base font-medium text-muted-foreground mb-2">
                          {date}
                        </h3>
                        <div className="flex flex-wrap flex-shrink items-center gap-6 w-full">
                          {transfers &&
                            // @ts-ignore
                            transfers.map((transfer, index) => (
                              <div
                                key={index}
                                className="bg-background/50 border border-dialog-border p-3 rounded-lg flex w-[300px] items-center justify-between"
                              >
                                <div className="flex items-center space-x-4">
                                  <MediaRenderer
                                    client={client}
                                    src={
                                      transfer.nft?.metadata.image ||
                                      transfer.nft?.tokenURI
                                    }
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div>
                                    <p className="font-semibold">
                                      {transfer.type === "send"
                                        ? "Sent"
                                        : "Received"}{" "}
                                      NFT
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {transfer.type === "send" ? "To" : "From"}
                                      :{" "}
                                      {getFormatAddress(
                                        transfer.type === "send"
                                          ? transfer.addressTo
                                          : transfer.addressFrom
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <Link
                                  href={`https://test.xfiscan.com/tx/${transfer.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLinkIcon className="w-5 h-5 text-sec-btn hover:text-sec-btn/85 transition-colors duration-300 ease-in-out" />
                                </Link>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </ScrollArea.Root>
      ) : (
        <Placeholder text="Connect Wallet to view your data" />
      )}
    </Layout>
  );
}

type PlaceholderProps = {
  text?: string;
};
function Placeholder({ text = "No Data Found" }: PlaceholderProps) {
  return (
    <div className="flex w-full items-center h-[75vh] justify-center">
      <p>{text}</p>
    </div>
  );
}
