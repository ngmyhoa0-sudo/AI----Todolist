package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Sort1;

public class Sort1Test {

    @Test
    void testNumber1Greater() {
        Sort1 x = new Sort1();
        x.setNumber1(5);
        x.setNumber2(2);
        x.sortAsc();
        assertTrue(x.getNumber1() == 2 && x.getNumber2() == 5);
    }

    @Test
    void testNumber1Less() {
        Sort1 x = new Sort1();
        x.setNumber1(2);
        x.setNumber2(5);
        x.sortAsc();
        assertTrue(x.getNumber1() == 2 && x.getNumber2() == 5);
    }
}
