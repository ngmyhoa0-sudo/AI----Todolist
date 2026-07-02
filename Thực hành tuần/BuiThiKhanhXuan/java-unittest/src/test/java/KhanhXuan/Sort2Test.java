package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Sort2;

public class Sort2Test {

    @Test
    void testNumber1Greater() {
        Sort2.number1 = 5;
        Sort2.number2 = 2;
        Sort2.sortDesc();
        assertTrue(Sort2.number1 == 5 && Sort2.number2 == 2);
    }

    @Test
    void testNumber1Less() {
        Sort2.number1 = 2;
        Sort2.number2 = 5;
        Sort2.sortDesc();
        assertTrue(Sort2.number1 == 5 && Sort2.number2 == 2);
    }
}
