import Image from 'next/image'
export function Logo({ size = 28 }: { size?: number }) {
  return <Image src="https://i.postimg.cc/28BygFTw/Logov3.png" alt="On3oard" width={size} height={size} priority />
}
