#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, maxTokens;
    cin >> n >> maxTokens;

    vector<int> tokens(n), importance(n);

    string line;
    getline(cin, line); // clear newline

    //input
    for (int i = 0; i < n; i++) {
        cin >> tokens[i] >> importance[i];
        getline(cin, line); // ignore text part
    }

    vector<vector<int>> dp(n + 1, vector<int>(maxTokens + 1, 0)); //for dp table

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= maxTokens; w++) {
            if (tokens[i - 1] <= w) {
                dp[i][w] = max(
                    dp[i - 1][w],
                    dp[i - 1][w - tokens[i - 1]] + importance[i - 1]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // printing dp table
    cout << "TABLE\n";
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= maxTokens; w++) {
            cout << dp[i][w] << " ";
        }
        cout << "\n";
    }

    // backtracking
    int w = maxTokens;
    vector<int> selected;

    for (int i = n; i > 0; i--) {
        if (dp[i][w] != dp[i - 1][w]) {
            selected.push_back(i - 1);
            w -= tokens[i - 1];
        }
    }

    reverse(selected.begin(), selected.end());

    //printing selected context
    cout << "SELECTED\n";
    for (int i : selected) {
        cout << i << " ";
    }

    return 0;
}