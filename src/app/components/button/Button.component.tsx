import styles from "./Button.module.css";

type ButtonProps = {
  name: string;
};

function Button({ name }: ButtonProps) {
  return <button className={styles.button}>{name}</button>;
}

export default Button;
