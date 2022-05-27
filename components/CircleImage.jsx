
export default function CircleImage({ image, isOnline }) {
  return (
    <div className="circle__image">
      { isOnline ?
        <div className="online__indicator" /> : null
      }
      <div className="circle__image--container">
        <img
          src={image}
          alt="Profile"
          width="50"
          height="50"
          className="profile__image"
        />
      </div>
    </div>
  )
}
