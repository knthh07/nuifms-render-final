import{j as e,M as c,B as x,a as o,P as i,T as a,b as s}from"./index-B_0z6FjQ.js";const h=({open:l,onClose:r,request:n,onApprove:t,onReject:d})=>e.jsx(c,{open:l,onClose:r,"aria-labelledby":"request-details-modal-title","aria-describedby":"request-details-modal-description",closeAfterTransition:!0,BackdropComponent:x,BackdropProps:{timeout:0,sx:{backdropFilter:"blur(5px)"}},children:e.jsxs(o,{sx:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"90%",maxWidth:900,p:4,display:"flex",flexDirection:{xs:"column",sm:"row"},gap:3,outline:"none"},children:[e.jsxs(i,{elevation:3,sx:{flex:1,p:3,bgcolor:"background.paper",boxShadow:3,borderRadius:2,overflowY:"auto"},children:[e.jsx(a,{variant:"h5",component:"h2",mb:2,children:"Application Details"}),n&&e.jsxs(e.Fragment,{children:[e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",children:[e.jsx("strong",{children:"Requestor:"})," ",n.firstName," ",n.lastName]})}),e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",sx:{maxHeight:"300px",overflowY:"auto",whiteSpace:"normal"},children:[e.jsx("strong",{children:"Description:"})," ",n.jobDesc]})}),e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",children:[e.jsx("strong",{children:"Building:"})," ",n.building]})}),e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",children:[e.jsx("strong",{children:"Campus:"})," ",n.campus]})}),e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",children:[e.jsx("strong",{children:"Floor:"})," ",n.floor]})}),e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",children:[e.jsx("strong",{children:"Requesting College/Office:"})," ",n.reqOffice]})}),e.jsx(o,{component:i,elevation:2,sx:{p:2,mb:2},children:e.jsxs(a,{variant:"body1",children:[e.jsx("strong",{children:"Date Requested:"})," ",new Date(n.createdAt).toLocaleDateString()]})}),e.jsxs(o,{sx:{mt:3,display:"flex",justifyContent:"flex-end",gap:2},children:[e.jsx(s,{variant:"contained",color:"success",onClick:()=>t(n._id),children:"Approve"}),e.jsx(s,{variant:"contained",color:"error",onClick:()=>d(n),children:"Reject"})]})]})]}),(n==null?void 0:n.fileUrl)&&e.jsx(i,{elevation:3,sx:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",p:2,bgcolor:"background.paper",borderRadius:2},children:e.jsx("img",{src:n.fileUrl,alt:"Submitted File",style:{width:"100%",height:"auto",borderRadius:"8px"}})})]})});export{h as default};