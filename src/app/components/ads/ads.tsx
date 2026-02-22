export default function ADS(props: { place: string }) {
  const { place } = props;
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-rose-300">
      <div className="text-center font-bold text-rose-400 uppercase">
        ADS PLACE #{place}
      </div>
    </div>
  );
}
