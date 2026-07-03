package Xuan;

public class Advance5 {

    public boolean kiemTraDoiXung(int number) {
        String s = String.valueOf(Math.abs(number));
        String reversed = new StringBuilder(s).reverse().toString();
        return s.equals(reversed);
    }
}
