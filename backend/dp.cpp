#include <bits/stdc++.h>
using namespace std;

struct Message {
    int tokens;
    int importance;
    string text;
};

vector<int> selectMessages(vector<Message>& msgs, int maxTokens) {
    int n = msgs.size();

    vector<vector<int>> dp(n + 1, vector<int>(maxTokens + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= maxTokens; w++) {
            if (msgs[i - 1].tokens <= w) {
                dp[i][w] = max(
                    dp[i - 1][w],
                    dp[i - 1][w - msgs[i - 1].tokens] + msgs[i - 1].importance
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    int w = maxTokens;
    vector<int> selected;

    for (int i = n; i > 0; i--) {
        if (dp[i][w] != dp[i - 1][w]) {
            selected.push_back(i - 1);
            w -= msgs[i - 1].tokens;
        }
    }

    reverse(selected.begin(), selected.end());
    return selected;
}

int main() {
    int n, maxTokens;
    cin >> n >> maxTokens;

    vector<Message> msgs(n);

    for (int i = 0; i < n; i++) {
        cin >> msgs[i].tokens >> msgs[i].importance;
        cin.ignore();
        getline(cin, msgs[i].text);
    }

    vector<int> result = selectMessages(msgs, maxTokens);

    for (int idx : result) {
        cout << idx << " ";
    }

    return 0;
}