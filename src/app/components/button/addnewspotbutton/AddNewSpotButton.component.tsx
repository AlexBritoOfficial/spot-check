import styles from "./AddNewSpotButton.module.css";

type ButtonProps = {
  name: string;
};

function AddNewSpotButton({ name }: ButtonProps) {
  return <button className={styles.button}>{name}</button>;
}

export default AddNewSpotButton;
