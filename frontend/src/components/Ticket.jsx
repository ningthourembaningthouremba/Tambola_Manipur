
const Ticket = ({ tno, data, name, called }) => {
  
  return (
    <section>
      <div className='flex justify-between p-2 text-[0.9rem]'>
        <p>T.no. : {tno}</p>
        <p>{name}</p>
      </div>
      <div className='grid grid-cols-9 gap-px bg-slate-500 text-slate-900 rounded-[8px] overflow-hidden border-[2px] border-slate-500'>
        {data.map((_,i) => (
          <div key={i} className={`${called.includes(data[i]) ? "bg-slate-700 text-white" : "bg-slate-300"} aspect-square flex justify-center items-center`}>
            {data[i] ? data[i] : ''}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Ticket