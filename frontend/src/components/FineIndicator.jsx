// import React, { useEffect, useState } from "react";

// export default function FineIndicator({ user }) {
//   const [fine, setFine] = useState(0);

//   useEffect(() => {
//     fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/fine`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.error) {
//           console.log(data.error);
//         } else {
//           setFine(data.fine);
//         }
//       });
//   }, []);

//   return (
//     <div style={{ position: "absolute", top: 10, right: 10 }}>
//       Fine as of today: ${fine}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";

export default function FineIndicator({ user }) {
  const [fine, setFine] = useState(0);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/fine`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.log(data.error);
        } else {
          setFine(data.fine);
        }
      });
  }, []);

  return (
    <div style={{ position: "absolute", top: 20, right: 80 }}>
      {/* Fine as of today: ${fine} */}
    </div>
  );
}
