const Card = ({ img, title, date }) => {
    return (
        <div className="rounded-md relative shadow-lg before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-[#00000000]
            before:to-[#000000]
            before:opacity-75
            before:z-5">
            <img src={img} alt={title} className="w-[450px] h-[270px] object-cover rounded-md" />
            <div className="absolute bottom-2 left-2 text-white px-4 py-2 rounded">
                <h3 className="font-bold text-[28px] uppercase">{title}</h3>
                <p className="text-[#5DC9DE] text-[20px]">{date}</p>
            </div>
        </div>
    );
};

export default Card;