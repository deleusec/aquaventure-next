import Image from "next/image";
import { Button } from "../ui/button";

export default function HeaderHome() {
  return (
    <div className="h-[calc(100vh-75px)] flex justify-center items-center">
      <Image
        src="/gradient_1.svg"
        width={600}
        height={600}
        alt="logo"
        className="object-contain h-full w-auto absolute top-0 left-0 -z-10 pointer-events-none"
        loading="eager"
      />
      <Image
        src="/gradient_2.svg"
        width={775}
        height={775}
        alt="logo"
        className="object-contain h-full w-auto absolute top-0 right-0 -z-10 pointer-events-none"
        loading="eager"
      />
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex-1 flex flex-col justify-center items-center z-10 pb-20 gap-8">
          <h1 className="text-start text-white">
            Dive into the Mysteries of the Deep
          </h1>
          <p className="text-base text-start text-white">
            Explore hidden treasures beneath the waves and experience
            unforgettable underwater adventures!
          </p>
          <div className="flex justify-start items-center w-full gap-4">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="default" size="lg">
              Get Started
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/fish.png"
            width={400}
            height={400}
            alt="logo"
            className="object-contain w-auto"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
