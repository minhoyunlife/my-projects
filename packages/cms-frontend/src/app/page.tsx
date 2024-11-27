"use client";

import { redirect } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { artworksApi } from "@/src/lib/api";

// export default function Home() {
//   redirect("/login");
// }

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      const artworks = await artworksApi.getArtworks();
      console.log(artworks);
      return artworks;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Artworks</h1>
      <pre>{JSON.stringify(data?.data, null, 2)}</pre>
    </div>
  );
}
