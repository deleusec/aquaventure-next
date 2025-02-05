import Image from "next/image";

export default function DiscoverHome() {
  return (
    <div className="min-h-screen w-full flex flex-col xl:flex-row items-center justify-center gap-10 p-4 xl:p-10">
      
      <div className="flex justify-center items-center w-full xl:w-auto">
        <Image
          src="/coral_image.png"
          width={500}
          height={500}
          alt="Coral with fish"
          className="object-contain max-h-72 sm:max-h-96 xl:max-h-[500px] w-auto rounded-lg min-h-[300px] xl:min-h-[500px]"
        />
      </div>

      <div className="flex-1 flex justify-center items-center p-4 xl:p-8 w-full">
        <div className="flex flex-col gap-4 max-w-3xl text-center xl:text-left">
          <h2 className="text-primary-foreground">
            Discover the beauty of the ocean and the wonders that lie beneath the waves.
          </h2>

          <ul className="flex flex-col gap-6">
            {[
              { title: "Explore", description: "Explore hidden treasures beneath the waves and experience unforgettable underwater adventures!" },
              { title: "Discover", description: "Discover the beauty of the ocean and the wonders that lie beneath the waves." },
              { title: "Learn", description: "Learn about the fascinating creatures that inhabit the ocean and the importance of protecting our marine ecosystems." },
            ].map((item, index) => (
              <li key={index} className="flex flex-col gap-1">
                <div className="flex items-center justify-center xl:justify-start gap-1">
                  <Image
                    src="/dot.svg"
                    width={8}
                    height={8}
                    alt="Dot"
                    className="object-contain w-auto"
                  />
                  <h3 className="text-primary-foreground">{item.title}</h3>
                </div>
                <p className="text-primary-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
