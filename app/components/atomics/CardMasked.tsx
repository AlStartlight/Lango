import Image from "next/image";

type MaskedCardProps = {
    className?: string;
    imgSrc?: string;
    names?: string;
    language?: string;
};
function MaskedCard({ className, imgSrc, names, language }: MaskedCardProps) {
  return (
    <div className={`w-full h-12 bg-gray-300 rounded-md animate-pulse ${className || ''}`}>
        <Image src={imgSrc || "/placeholder.png"} alt="Masked Card Image" width={48} height={48} className="object-cover rounded-full absolute -top-6 left-4" />
       <div className="">
        <h4>Speaks</h4>
        <p>{language || "Language"}</p>
        <hr  className="h-1"/>
        <p>{names || "Names"}</p>
       </div>
    </div>
  );
}

export default MaskedCard;