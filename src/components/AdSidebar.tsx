export default function AdSidebar() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{width:300,height:250,background:"var(--wash)",border:"1px dashed var(--line)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",fontSize:13,fontWeight:600,letterSpacing:".04em"}}>
        AD 300×250
      </div>
      <div style={{position:"sticky",top:20,width:300,height:600,background:"var(--wash)",border:"1px dashed var(--line)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",fontSize:13,fontWeight:600,letterSpacing:".04em"}}>
        AD 300×600
      </div>
    </div>
  );
}
