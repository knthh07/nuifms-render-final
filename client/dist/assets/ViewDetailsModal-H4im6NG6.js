import{j as o,M as s,B as c,a as n,I as d,d as x,P as a,T as i}from"./index-CLTVkiPz.js";const h=({open:l,onClose:r,request:e})=>o.jsx(s,{open:l,onClose:r,"aria-labelledby":"request-details-modal-title","aria-describedby":"request-details-modal-description",closeAfterTransition:!0,BackdropComponent:c,BackdropProps:{timeout:0,sx:{backdropFilter:"blur(5px)"}},children:o.jsxs(n,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"90%",maxWidth:900,p:4,display:"flex",flexDirection:{xs:"column",sm:"row"},gap:3,outline:"none"},children:[o.jsx(d,{"aria-label":"close",onClick:r,sx:{position:"absolute",top:32,right:32,color:t=>t.palette.grey[500]},children:o.jsx(x,{})}),o.jsxs(a,{elevation:3,sx:{flex:1,p:3,bgcolor:"background.paper",boxShadow:3,borderRadius:2,overflowY:"auto"},children:[o.jsx(i,{variant:"h5",component:"h2",mb:2,children:"Application Details"}),e&&o.jsxs(o.Fragment,{children:[o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",children:[o.jsx("strong",{children:"Requestor:"})," ",e.firstName," ",e.lastName]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",sx:{wordBreak:"break-all",overflowX:"auto",maxHeight:"200px",overflowY:"auto",whiteSpace:"normal"},children:[o.jsx("strong",{children:"Description:"})," ",e.jobDesc]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",sx:{wordBreak:"break-all",overflowX:"auto",maxHeight:"200px",overflowY:"auto",whiteSpace:"normal"},children:[o.jsx("strong",{children:"Description:"})," ",e.scenario]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",sx:{wordBreak:"break-all",overflowX:"auto",maxHeight:"200px",overflowY:"auto",whiteSpace:"normal"},children:[o.jsx("strong",{children:"Description:"})," ",e.object]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",children:[o.jsx("strong",{children:"Building:"})," ",e.building]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",children:[o.jsx("strong",{children:"Campus:"})," ",e.campus]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",children:[o.jsx("strong",{children:"Floor:"})," ",e.floor]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",children:[o.jsx("strong",{children:"Requesting College/Office:"})," ",e.reqOffice]})}),o.jsx(n,{component:a,elevation:2,sx:{p:2,mb:2},children:o.jsxs(i,{variant:"body1",children:[o.jsx("strong",{children:"Date Requested:"})," ",new Date(e.createdAt).toLocaleDateString()]})})]})]}),(e==null?void 0:e.fileUrl)&&o.jsx(a,{elevation:3,sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",p:2,bgcolor:"background.paper",borderRadius:2},children:o.jsx("img",{src:e.fileUrl,alt:"Submitted File",style:{width:"100%",height:"auto",borderRadius:"8px",objectFit:"contain"}})})]})});export{h as default};